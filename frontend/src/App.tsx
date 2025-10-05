import { Calendar } from "./components/calendar";

function App() {
  return (
    <div className="min-h-svh flex flex-col max-w-4xl w-full mx-auto py-20">
      <h1 className="text-2xl font-bold">Book your meeting</h1>
      <Calendar />
    </div>
  );
}

export default App;
