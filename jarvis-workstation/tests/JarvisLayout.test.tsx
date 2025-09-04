import { render, screen } from "@testing-library/react";
import JarvisLayout from "../components/layout/JarvisLayout";

// Mock the context provider
jest.mock("../context/AppContext", () => ({
  AppProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-provider">{children}</div>
  ),
}));

// Mock the UI components
jest.mock("../components/ui/TopMenu", () => {
  return function MockTopMenu() {
    return <div data-testid="top-menu">Top Menu</div>;
  };
});

jest.mock("../components/ui/SidePanel", () => {
  return function MockSidePanel() {
    return <div data-testid="side-panel">Side Panel</div>;
  };
});

jest.mock("../components/ui/MainPanel", () => {
  return function MockMainPanel() {
    return <div data-testid="main-panel">Main Panel</div>;
  };
});

jest.mock("../components/ui/BottomPanel", () => {
  return function MockBottomPanel() {
    return <div data-testid="bottom-panel">Bottom Panel</div>;
  };
});

describe("JarvisLayout", () => {
  it("renders without crashing", () => {
    render(<JarvisLayout>Test Content</JarvisLayout>);
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("contains all main layout components", () => {
    render(<JarvisLayout>Test Content</JarvisLayout>);

    expect(screen.getByTestId("app-provider")).toBeInTheDocument();
    expect(screen.getByTestId("top-menu")).toBeInTheDocument();
    expect(screen.getByTestId("side-panel")).toBeInTheDocument();
    expect(screen.getByTestId("main-panel")).toBeInTheDocument();
    expect(screen.getByTestId("bottom-panel")).toBeInTheDocument();
  });

  it("renders children content", () => {
    const testContent = "Welcome to Jarvis Workstation";
    render(<JarvisLayout>{testContent}</JarvisLayout>);
    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  it("has correct CSS classes for layout", () => {
    const { container } = render(<JarvisLayout>Test</JarvisLayout>);
    const mainContainer = container.firstChild as HTMLElement;

    expect(mainContainer).toHaveClass(
      "flex",
      "flex-col",
      "h-screen",
      "bg-gray-50",
    );
  });
});
