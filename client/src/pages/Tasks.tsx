import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import {
  FiLogOut,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiSearch,
  FiCheckCircle,
  FiClock,
  FiActivity,
  FiAlertCircle,
} from "react-icons/fi";
import {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from "../../services/taskApi";
import { useProfileQuery } from "../../services/authApi";
import { useToast } from "../context/ToastContext";

// Task Validation Schema
const taskSchema = z.object({
  title: z.string().min(1, { message: "Task title is required" }),
  description: z.string().optional().default(""),
  priority: z.enum(["high", "medium", "low"]),
  status: z.enum(["pending", "in-progress", "completed"]),
});

const Tasks = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const token = localStorage.getItem("token");

  const { data: profileData } = useProfileQuery(undefined, { skip: !token });
  const { data: tasksData, isLoading: isTasksLoading } = useGetTasksQuery(undefined, {
    skip: !token,
  });

  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [deleteTask,{isLoading: isDeleting}] = useDeleteTaskMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "pending",
    },
  });

  // Open modal for creating a task
  const handleCreateOpen = () => {
    setEditingTask(null);
    reset({
      title: "",
      description: "",
      priority: "medium",
      status: "pending",
    });
    setIsModalOpen(true);
  };

  // Open modal for editing a task
  const handleEditOpen = (task) => {
    setEditingTask(task);
    setValue("title", task.title);
    setValue("description", task.description || "");
    setValue("priority", task.priority);
    setValue("status", task.status);
    setIsModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingTask) {
        await updateTask({ id: editingTask._id, ...data }).unwrap();
        showToast("Task Updated", "The task was updated successfully.", "success");
      } else {
        await createTask(data).unwrap();
        showToast("Task Created", "A new task has been created.", "success");
      }
      setIsModalOpen(false);
      reset();
    } catch (err) {
      showToast(
        "Error Saving Task",
        err.data?.message || err.message || "Failed to save task.",
        "error"
      );
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(id).unwrap();
        showToast("Task Deleted", "The task was deleted successfully.", "success");
      } catch (err) {
        showToast("Error Deleting Task", "Failed to delete task.", "error");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    showToast("Logged Out", "You have been securely logged out.", "success");
    navigate("/");
  };

  // Filter and search tasks
  const tasksList = tasksData?.data || [];
  const filteredTasks = tasksList.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: tasksList.length,
    pending: tasksList.filter((t) => t.status === "pending").length,
    inProgress: tasksList.filter((t) => t.status === "in-progress").length,
    completed: tasksList.filter((t) => t.status === "completed").length,
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 font-sans pb-12">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 border-b border-slate-800 bg-slate-950/40 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-black text-white text-base">
              G
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Genix
            </span>
          </div>

          <div className="flex items-center gap-4">
            {profileData?.data && (
              <span className="text-sm font-semibold text-slate-300">
                Hi, {profileData.data.name}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border border-slate-800 hover:border-slate-700 hover:bg-slate-900/60 hover:text-red-400 transition-all cursor-pointer"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl glass-panel-dark flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tasks</p>
              <h3 className="text-3xl font-extrabold mt-1">{stats.total}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center text-slate-400">
              <FiActivity className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-panel-dark flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending</p>
              <h3 className="text-3xl font-extrabold mt-1 text-yellow-500">{stats.pending}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
              <FiClock className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-panel-dark flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">In Progress</p>
              <h3 className="text-3xl font-extrabold mt-1 text-blue-500">{stats.inProgress}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <FiAlertCircle className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-panel-dark flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed</p>
              <h3 className="text-3xl font-extrabold mt-1 text-emerald-500">{stats.completed}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <FiCheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Toolbar (Search & Filter) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-xl">
            {/* Search */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <FiSearch className="w-5 h-5" />
              </span>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2.5 pl-10 pr-4 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-indigo-500 focus:outline-none text-sm transition-all"
              />
            </div>

            {/* Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2.5 px-4 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-indigo-500 focus:outline-none text-sm cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <button
            onClick={handleCreateOpen}
            className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm transition-all shadow-lg shadow-indigo-600/15 cursor-pointer"
          >
            <FiPlus className="w-5 h-5" />
            <span>Create Task</span>
          </button>
        </div>

        {/* Task Cards Grid */}
        {isTasksLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-slate-800 bg-slate-950/20 mt-4">
            <p className="text-slate-400 text-base">No tasks found matching your filters.</p>
            <button
              onClick={handleCreateOpen}
              className="mt-4 inline-flex items-center gap-2 py-2 px-4 rounded-lg bg-slate-850 hover:bg-slate-800 text-sm font-semibold transition-colors cursor-pointer"
            >
              <FiPlus className="w-4 h-4" />
              <span>Add your first task</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <div
                key={task._id}
                className="relative overflow-hidden flex flex-col justify-between p-6 rounded-2xl glass-panel-dark border border-slate-800/80 hover:border-slate-700/80 hover:shadow-xl hover:shadow-indigo-500/[0.01] transition-all group"
              >
                {/* Task Content */}
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    {/* Status Badge */}
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        task.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : task.status === "in-progress"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                      }`}
                    >
                      {task.status === "completed"
                        ? "Completed"
                        : task.status === "in-progress"
                        ? "In Progress"
                        : "Pending"}
                    </span>

                    {/* Priority Badge */}
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${
                        task.priority === "high"
                          ? "text-red-400"
                          : task.priority === "medium"
                          ? "text-yellow-400"
                          : "text-slate-400"
                      }`}
                    >
                      {task.priority} Priority
                    </span>
                  </div>

                  <h4 className="text-lg font-bold text-slate-100 group-hover:text-white transition-colors leading-snug">
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="mt-2 text-sm text-slate-400 line-clamp-3 leading-relaxed font-medium">
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between border-t border-slate-800/80 mt-5 pt-4">
                  <span className="text-xs text-slate-500 font-medium">
                    Created: {new Date(task.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditOpen(task)}
                      className="p-2 rounded-lg bg-slate-800/40 hover:bg-indigo-600/20 hover:text-indigo-400 text-slate-400 border border-transparent hover:border-indigo-500/20 transition-all cursor-pointer"
                      title="Edit Task"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(task._id)}
                      className="p-2 rounded-lg bg-slate-800/40 hover:bg-red-600/20 hover:text-red-400 text-slate-400 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
                      title="Delete Task"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Task Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg p-6 rounded-3xl glass-panel-dark border border-slate-800 shadow-2xl animate-scale-up">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-extrabold mb-6">
              {editingTask ? "Edit Task" : "Create New Task"}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Title */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Finish landing page"
                  className={`w-full py-3 px-4 rounded-xl bg-slate-900 border ${
                    errors.title ? "border-red-500/50 focus:border-red-500" : "border-slate-800 focus:border-indigo-500"
                  } focus:outline-none text-sm font-medium transition-all`}
                  {...register("title")}
                />
                {errors.title && (
                  <span className="text-xs text-red-400 mt-1 ml-1 font-semibold">
                    {errors.title.message}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Description (Optional)
                </label>
                <textarea
                  placeholder="Describe the details of this task..."
                  rows={3}
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:outline-none text-sm font-medium transition-all resize-none"
                  {...register("description")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Priority */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Priority
                  </label>
                  <select
                    className="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:outline-none text-sm font-semibold cursor-pointer"
                    {...register("priority")}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Status */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Status
                  </label>
                  <select
                    className="w-full py-3 px-4 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:outline-none text-sm font-semibold cursor-pointer"
                    {...register("status")}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Submit buttons */}
              <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-3 px-5 rounded-xl border border-slate-800 hover:border-slate-700 font-semibold text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm transition-all shadow-lg shadow-indigo-600/15 cursor-pointer disabled:opacity-75"
                >
                  {isCreating || isUpdating ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : editingTask ? (
                    "Save Changes"
                  ) : (
                    "Create Task"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
