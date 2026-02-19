import { Navigate, Route, Routes } from "react-router-dom";
import { NoteEditorPage } from "@/pages/note-editor-page";

function App() {
  return (
    <Routes>
      <Route
        path='/'
        element={
          <Navigate
            to='/editor'
            replace
          />
        }
      />
      <Route
        path='/editor'
        element={<NoteEditorPage />}
      />
      <Route
        path='/editor/:id'
        element={<NoteEditorPage />}
      />
      <Route
        path='*'
        element={
          <Navigate
            to='/editor'
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;
