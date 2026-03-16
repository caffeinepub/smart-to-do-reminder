import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Task {
    id: string;
    title: string;
    createdAt: bigint;
    completed: boolean;
    dueDate: string;
    description: string;
    dueTime: string;
    priority: string;
}
export interface backendInterface {
    createTask(id: string, title: string, description: string, dueDate: string, dueTime: string, priority: string): Promise<void>;
    deleteTask(id: string): Promise<void>;
    getAllTasks(): Promise<Array<Task>>;
    updateTask(id: string, title: string, description: string, dueDate: string, dueTime: string, priority: string, completed: boolean): Promise<void>;
}
