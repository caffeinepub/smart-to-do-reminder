import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Iter "mo:core/Iter";

actor {
  type Task = {
    id : Text;
    title : Text;
    description : Text;
    dueDate : Text;
    dueTime : Text;
    priority : Text; // "low", "medium", "high"
    completed : Bool;
    createdAt : Int;
  };

  module Task {
    public func compareByCreatedAtDesc(a : Task, b : Task) : Order.Order {
      Int.compare(b.createdAt, a.createdAt);
    };
  };

  let tasks = Map.empty<Text, Task>();

  public shared ({ caller }) func createTask(id : Text, title : Text, description : Text, dueDate : Text, dueTime : Text, priority : Text) : async () {
    if (tasks.containsKey(id)) {
      Runtime.trap("Task with this ID already exists.");
    };

    let task : Task = {
      id;
      title;
      description;
      dueDate;
      dueTime;
      priority;
      completed = false;
      createdAt = Time.now();
    };
    tasks.add(id, task);
  };

  public shared ({ caller }) func updateTask(id : Text, title : Text, description : Text, dueDate : Text, dueTime : Text, priority : Text, completed : Bool) : async () {
    switch (tasks.get(id)) {
      case (null) {
        Runtime.trap("Task not found");
      };
      case (?existingTask) {
        let updatedTask : Task = {
          existingTask with
          title;
          description;
          dueDate;
          dueTime;
          priority;
          completed;
        };
        tasks.add(id, updatedTask);
      };
    };
  };

  public shared ({ caller }) func deleteTask(id : Text) : async () {
    switch (tasks.get(id)) {
      case (null) {
        Runtime.trap("Task not found");
      };
      case (?_) {
        tasks.remove(id);
      };
    };
  };

  public query ({ caller }) func getAllTasks() : async [Task] {
    tasks.values().toArray().sort(Task.compareByCreatedAtDesc);
  };
};
