import Dashboard from "./pages/Dashboard";
import TeacherLogin from "./pages/TeacherLogin";
import ManualAttendance from "./pages/ManualAttendance";

function App() {
  const isLoggedIn = localStorage.getItem("teacher") !== null;

  if (isLoggedIn) {
    return <Dashboard />;
  }

  return <TeacherLogin />;
}

export default App;