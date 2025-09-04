export default function StatWidget({ title, value, type = "default" }) {
  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return "text-accent-1 shadow-glow-accent";
      case "warning":
        return "text-accent-2 shadow-glow-warning";
      case "error":
        return "text-accent-4 shadow-glow-error";
      case "info":
        return "text-accent-3 shadow-glow";
      default:
        return "text-primary shadow-glow";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-glow hover:shadow-lg transition-all duration-300">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium">
        {title}
      </p>
      <p className={`text-3xl font-bold ${getTypeStyles()}`}>{value ?? 0}</p>
    </div>
  );
}
