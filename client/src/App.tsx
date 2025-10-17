import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Entities from "./pages/Entities";
import EntityForm from "./pages/EntityForm";
import PressReleases from "./pages/PressReleases";
import PressReleaseForm from "./pages/PressReleaseForm";
import PressReleaseView from "./pages/PressReleaseView";
import Feed from "./pages/Feed";

function Router() {
  return (
    <Switch>
      <Route path="/" component={PressReleases} />
      <Route path="/press-releases" component={PressReleases} />
      <Route path="/press-releases/new" component={PressReleaseForm} />
      <Route path="/press-releases/:id/edit" component={PressReleaseForm} />
      <Route path="/press-releases/:id/view" component={PressReleaseView} />
      <Route path="/entities" component={Entities} />
      <Route path="/entities/new" component={EntityForm} />
      <Route path="/entities/:id/edit" component={EntityForm} />
      <Route path="/feed" component={Feed} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
