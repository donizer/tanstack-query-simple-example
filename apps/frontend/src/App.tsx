import { Navigate, Route, Routes } from "react-router-dom";
import { NoteEditorPage } from "@/components/note-editor-page";
import { LearnLayout } from "@/pages/learn/learn-layout";
import { BasicNotesPage } from "@/pages/learn/basic-notes-page";
import { SuspenseNotesPage } from "@/pages/learn/suspense-notes-page";
import { PaginatedNotesPage } from "@/pages/learn/paginated-notes-page";
import { InfiniteNotesPage } from "@/pages/learn/infinite-notes-page";
import { ShittyUseEffectPage } from "@/pages/learn/shitty-use-effect-page";

function App() {
  return (
    <Routes>
      <Route
        path='/'
        element={
          <Navigate
            to='/learn/basic'
            replace
          />
        }
      />
      <Route
        path='/learn'
        element={<LearnLayout />}
      >
        <Route
          index
          element={
            <Navigate
              to='basic'
              replace
            />
          }
        />
        <Route
          path='basic'
          element={<BasicNotesPage />}
        />
        <Route
          path='suspense'
          element={<SuspenseNotesPage />}
        />
        <Route
          path='pagination'
          element={<PaginatedNotesPage />}
        />
        <Route
          path='infinite'
          element={<InfiniteNotesPage />}
        />
        <Route
          path='shitty-use-effect'
          element={<ShittyUseEffectPage />}
        />
      </Route>
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
            to='/learn/basic'
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;
