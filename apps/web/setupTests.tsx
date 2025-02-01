import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock SUID components
vi.mock("@suid/material", () => ({
  Box: (props: any) => <div data-testid="box" {...props}>{props.children}</div>,
  Typography: (props: any) => <div data-testid="typography" {...props}>{props.children}</div>,
  Button: (props: any) => <button data-testid="button" {...props}>{props.children}</button>,
  Container: (props: any) => <div data-testid="container" {...props}>{props.children}</div>
}));

// Add custom matchers
// expect.extend({
//   toHaveStyle(received, style) {
//     const pass = Object.entries(style).every(
//       ([key, value]) => received.style[key] === value
//     );
//     return {
//       pass,
//       message: () => `expected ${received} to have style ${style}`
//     };
//   }
// });
