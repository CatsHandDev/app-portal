export interface Todo {
  id: number;
  title: string;
  deadline: string;
  importance: number;
  completed: boolean;
  tag: string;
}

export interface AccountData {
  userId: string;
  todos: Todo[];
  tags: string[];
}

export interface Data {
  accounts: {
    userId: string;
    todos: Todo[];
    tags: string[];
  }[];
}

export interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: any;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  newTodo: {
    title: string;
    deadline: string;
    importance: number;
    tag: string;
  };
  setNewTodo: React.Dispatch<React.SetStateAction<{
    title: string;
    deadline: string;
    importance: number;
    tag: string;
  }>>;
  handleAddTodo: (newTodo: Omit<Todo, "id" | "completed">) => Promise<void>;
}