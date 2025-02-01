import { render } from "@solidjs/testing-library";
import { Route, Router } from "@solidjs/router";
import Home from "./Home";

describe("<Home/>", () => {
  it("renders hero section with welcome message and a button to request project", () => {
    const { getByText } = render(() => (
      <Router>
        <Route path="/" component={Home} />
      </Router>
    ));

    expect(getByText("Welcome to Our Application")).toBeInTheDocument();
    const button = getByText("Get Started");
    expect(button).toBeInTheDocument();
    expect(button.closest("a")).toHaveAttribute("href", "/request-project");
  });
});
