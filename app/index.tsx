import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button, ProgressBar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

interface TodoItem {
  id: string;
  text: string;
  isCompleted: boolean;
}

const generateIdTodo = () => {
  return Date.now().toString(36) + Math.random();
};

const defaultData = [
  { id: generateIdTodo(), text: "Set Env", isCompleted: false },
  { id: generateIdTodo(), text: "Create project", isCompleted: false },
  {
    id: generateIdTodo(),
    text: "Customize  structure",
    isCompleted: false,
  },
];
const STORAGE_KEY = "TODO_LISTS";

const TodoLists = () => {
  const [textInput, setTextInput] = useState<string>("");

  const [todoLists, setTodoLists] = useState<TodoItem[]>([]);

  const progress = useMemo(() => {
    if (todoLists.length === 0) {
      return 0;
    }
    const completedCount = todoLists.filter((item) => item.isCompleted).length;
    return completedCount / todoLists.length;
  }, [todoLists]);

  const initTodoLists = useCallback(async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue !== null) {
        setTodoLists(JSON.parse(jsonValue));
      } else {
        setTodoLists(defaultData);
      }
    } catch (e) {
      console.error("initTodoLists : Failed to load.", e);
    }
  }, []);

  const handleSaveTodoLists = async () => {
    try {
      const jsonValue = JSON.stringify(todoLists);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (e) {
      console.error("handleSaveTodoLists : Failed to save.", e);
    }
  };

  const handleAddTodoLists = () => {
    const newItem = {
      id: generateIdTodo(),
      text: textInput,
      isCompleted: false,
    };
    setTodoLists([...todoLists, newItem]);
    setTextInput("");
  };

  const handleToggleComplete = (id: string) => {
    const newTodos = todoLists.map((item) =>
      item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
    );
    setTodoLists(newTodos);
  };

  const handleDeleteItem = (id: string) => {
    const newTodos = todoLists.filter((item) => item.id !== id);
    setTodoLists(newTodos);
  };

  useEffect(() => {
    initTodoLists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    handleSaveTodoLists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todoLists]);

  const renderItem = (item: TodoItem) => (
    <View style={styles.todoItem}>
      <TouchableOpacity
        style={styles.todoTextContainer}
        onPress={() => handleToggleComplete(item.id)}
      >
        <Text
          style={[styles.todoText, item.isCompleted && styles.completedText]}
        >
          {item.text}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteItem(item.id)}
      >
        <Text style={styles.deleteButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["right", "bottom", "left"]}>
      <FlatList
        data={todoLists}
        keyExtractor={(item, index) => `${index}-${item.id}`}
        renderItem={({ item }) => renderItem(item)}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <ProgressBar
              progress={progress}
              style={styles.progress}
              color="#189bcc"
            />

            <TextInput
              style={styles.input}
              placeholder="Add new todo list"
              value={textInput}
              onChangeText={setTextInput}
            />
            <Button
              mode="contained"
              buttonColor="#189bcc"
              onPress={handleAddTodoLists}
              disabled={!textInput.trim()}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </Button>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  todoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
  },
  todoTextContainer: {
    flex: 1,
  },
  todoText: {
    fontSize: 18,
    color: "#333333",
  },
  completedText: {
    textDecorationLine: "line-through",
    color: "#aaa",
  },
  deleteButton: {
    marginLeft: 15,
  },
  deleteButtonText: {
    fontSize: 20,
    color: "#ff3366",
  },
  headerContainer: {
    flexDirection: "column",
    gap: 10,
    padding: 15,
    borderTopColor: "#ddd",
    backgroundColor: "#ffffff",
  },
  progress: {
    width: "100%",
    height: 10,
    borderRadius: 8,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 16,
  },
});

export default TodoLists;
