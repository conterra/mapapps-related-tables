# Bundle Documentation Template

This document provides templates and guidelines for creating and documenting map.apps bundles.

## Bundle Documentation Structure

**When documenting a bundle, use the following template:**

### Bundle Name
- Use the bundle name from `manifest.json`

### Bundle Description
- Provide a clear summary of the bundle's functionality in 3-5 sentences

### Usage
**Outline the steps required to use the bundle in an app:**
- If the `manifest.json` provides a Tool, it must be added to a toolset in the `app.json`
- Ensure tool IDs are referenced correctly
- Do not include code snippets for this section

### Configuration Reference
**Provide a configuration snippet that can be added to an app:**
- Only include properties of the Config component

```json
{
    "<bundle-name>": {
        "Config": {
            "<properties of the Config-component and their values>"
        }
    }
}
```

Include a table of properties provided by the Config component:

| Property | Type | Values | Default | Description |
|----------|------|--------|---------|-------------|

**Additional Documentation Notes:**
- After creating the property table, consult with the developer about:
  - Edge cases that should be documented
  - Settings that are prone to errors
  - Any special configuration requirements

**If additional information is needed, add a section:**
#### Additional Considerations
- Include any developer-provided remarks about edge cases or error-prone settings

---

# Bundle Creation Process

## Initial Setup
**When prompted to create a new bundle:**

1. **Ask for the bundle name** from the developer
2. **Create the bundle folder structure** in `src/main/js/bundles/<bundle-name>/`

## Creating the Manifest File
**Create a `manifest.json` file with the following template:**

```json
{
    "name": "<bundle name from prompt>",
    "version": "1.0.0",
    "title": "${bundleName}",
    "description": "${bundleDescription}",
    "vendor": "con terra GmbH",
    "productName": "CHANGE ME",
    "keywords": [
        "sample"
    ],
    "main": "",
    "i18n": ["bundle"],
    "dependencies": {},
    "cssThemesExtension": [
        {
            "name": "*",
            "files": [
                "./css/styles.css"
            ]
        }
    ],
    "layout-widgets": [],
    "components": []
}
```

## Widget Integration (Optional)
**Ask the developer if they want to include a widget in their bundle.**

**If yes, add the widget configuration:**

1. **Add to `layout-widgets` array:**
```json
{
    "widgetRole": "sampleWidgetRole",
    "window": {
        "title": "${ui.window.title}",
        "dockTool": "sampleWidgetToggleTool",
        "closable": true,
        "minimizeOnClose": true,
        "resizable": true,
        "marginBox": {
            "w": 500,
            "r": 0,
            "t": 40,
            "b": "40%"
        },
        "windowClass": "noPadding"
    }
}
```

2. **Add toggle tool to `components` array:**
```json
{
    "name": "SampleWidgetToggleTool",
    "impl": "ct/tools/Tool",
    "provides": [
        "ct.tools.Tool"
    ],
    "propertiesConstructor": true,
    "properties": {
        "id": "sampleWidgetToggleTool",
        "title": "${ui.tool.title}",
        "tooltip": "${ui.tool.tooltip}",
        "iconClass": "material-icon-auto_awesome",
        "toolRole": "toolset",
        "togglable": true,
        "rules": {
            "noGroup": true
        }
    }
}
```

## Internationalization (i18n) Setup
**Create the following folder structure and files:**

```
nls/
├── bundle.ts
└── de/
    └── bundle.ts
```

**Root bundle file (`nls/bundle.ts`):**
```ts
const i18n = {
    root: ({
        bundleName: "<Bundle name split into words and capitalized>",
        bundleDescription: "CHANGE ME"
    }),
    "de": true
};

export type Messages = (typeof i18n)["root"];
export interface MessagesReference {
    get: () => Messages
}
export default i18n;
```

**German translation file (`nls/de/bundle.ts`):**
```ts
import { Messages } from "../bundle";

export default {
    bundleName: "<Bundle name split into words and capitalized>",
    bundleDescription: "CHANGE ME"
} satisfies Messages;
```

**Note:** If the developer included a widget, add UI elements with placeholders for:
- `ui.window.title`
- `ui.tool.title`
- `ui.tool.tooltip`

## Widget Model Creation (Optional)
**Ask the developer if they want to include a model in their bundle.**

**If yes, create `<BundleName>WidgetModel.ts`:**
```ts
import { Mutable, properties } from "apprt-core/Mutable";

export interface <BundleName>WidgetModelProperties {
    // prop: type
}

export class <BundleName>WidgetModel extends Mutable { }

properties(<BundleName>WidgetModel, {
    //prop: default
});
```

## Build Configuration
**Create a `build.config.js` file:**

```js
module.exports = {
    // normally the type should be "bundle"
    type: "bundle",
    // list all files, which should stay after the build
    // In this case only the "module.js" is the remaining artifact, all other files will be integrated into this file.
    entryPoints: ["./module"],
    npmDependencies: []
};
```

## Additional Files
**Create the following empty files:**
- `module.ts` (empty file)
- `api.ts` (empty file)

---

# JavaScript to TypeScript Migration Guide

## Overview
**When migrating JavaScript files to TypeScript in map.apps projects, follow these comprehensive steps to ensure proper type safety and consistency.**

## Migration Steps

### 1. File Extension and Basic Setup
**Actions to perform:**
- Change file extension from `.js` to `.ts`
- Keep the same copyright header and license information

### 2. Import Statement Updates
**Actions to perform:**
- **Update binding import:** Change `import Binding from "apprt-binding/Binding"` to `import { Binding } from "apprt-binding/Binding"`
- **Add type imports:** Add type-only imports using the `type` keyword:
  ```typescript
  import type { InjectedReference } from "apprt-core/InjectedReference";
  import type { MapWidgetModel } from "map-widget/MapWidgetModel";
  import type { <Bundlename>Controller } from "./<Bundlename>Controller";
  ```

### 3. Property Type Declarations
**Actions to perform:**
- **Replace private fields:** Convert `#<propertyname>` from private fields to TypeScript private properties:
  ```typescript
  // From:
  #<propertyname> = null;

  // To:
  private <propertyname>?: <TYPE>;
  ```

### 4. Injected Dependencies
**Actions to perform:**
- **Add type annotations for injected services:**
  ```typescript
  private _<bundlename>Controller: InjectedReference<<bundlename>Controller>;
  private _mapWidgetModel: InjectedReference<MapWidgetModel>;
  ```
- **Add type annotations for properties:**
  ```typescript
  private _properties: InjectedReference<Record<string, any>>;
  ```

### 5. Method Signatures
**Actions to perform:**
- **Add return types to all methods:**
  ```typescript
  activate(): void
  deactivate(): void
  createInstance(): typeof EsriDijit
  updateWidgetState(): void
  ```

### 6. Method Visibility
**Actions to perform:**
- **Make internal methods private:**
  ```typescript
  // From: _getWidget()
  // To: private getWidget()

  // From: _destroyWidget()
  // To: private destroyWidget()

  // From: _deactivateBinding()
  // To: private deactivateBinding()

  // From: _getView()
  // To: private getView()
  ```

### 7. Property Access Updates
**Actions to perform:**
- **Update property references:** Change from `this.#property` to `this.property`
- **Add non-null assertions where needed:** Use `!` operator for properties that are guaranteed to be defined:
  ```typescript
  const shadowCastProperties = this._shadowCastWidgetController!._properties;
  const isActive = this._shadowCastWidgetController!.isToolActive;
  ```

### 8. Promise and Type Annotations
**Actions to perform:**
- **Add proper return types for Promises:**
  ```typescript
  private getView(): Promise<__esri.MapView | __esri.SceneView>
  ```
- **Add parameter types in Promise callbacks:**
  ```typescript
  this.getView().then((_view: __esri.MapView | __esri.SceneView) => {
  ```

### 9. Optional Chaining and Null Handling
**Actions to perform:**
- **Replace null assignments:** Change `= null` to `= undefined` for optional properties
- **Use optional chaining consistently:** `this.shadowCastWidget?.destroy()`

### 10. Method Name Consistency
**Actions to perform:**
- **Remove underscores from private method calls:**
  ```typescript
  // From: this._deactivateBinding()
  // To: this.deactivateBinding()

  // From: this._destroyWidget()
  // To: this.destroyWidget()
  `````

### 11. TypeScript Compilation Check
**Actions to perform:**
- After migration, ensure the TypeScript compiler doesn't report any errors
- Run the "Watch types" task to verify compilation: `npm run watch-types`

## Best Practices
**Follow these guidelines:**
- Always prefer using types provided by map.apps or `__esri` over creating new types
- When creating new types, place them in the `api.ts` file and import them in the migrated class
- Use proper TypeScript access modifiers (`private`, `protected`, `public`)
- Leverage TypeScript's optional chaining and nullish coalescing operators
- Add proper JSDoc comments for complex type definitions

## Summary of Key Changes
**The following transformations are applied:**
1. File extension: `.js` → `.ts`
2. Import syntax: Add type imports and update binding import
3. Properties: `#field` → `private field?: Type`
4. Methods: Add return types and make internal methods private
5. Dependencies: Add proper type annotations for injected services
6. Promises: Add proper type annotations for async operations
7. Property access: Remove `#` prefix, add `!` assertions where needed

**Result:** This migration pattern maintains the same functionality while adding TypeScript's type safety and better IDE support.

---


# Test Generation Context and Guidelines

**This document provides context and instructions for generating high-quality, maintainable tests with minimal mocking.**

## Test File Organization
**Follow these conventions:**
- Tests should always be placed in the bundle folder: `<bundle-name>/tests`
- Use `all.ts` to import all test files **AND NOTHING ELSE**
- Do not include a README.md for the tests
- Use the `.spec.ts` convention for test files

### CRITICAL: all.ts File Structure
**The `all.ts` file should ONLY contain imports. Never put test cases in this file.**

```typescript
// CORRECT all.ts structure:
import "./ComponentName.spec";
import "./AnotherComponent.spec";
import "./ThirdComponent.spec";

// WRONG - Never put test cases directly in all.ts:
describe("MyBundle", () => {
  it("should do something", () => {
    // This belongs in a separate .spec.ts file!
  });
});
```

### Individual Test Files
**Each component should have its own `.spec.ts` file:**

```
tests/
├── all.ts                    // Only imports
├── ComponentA.spec.ts        // Tests for ComponentA
├── ComponentB.spec.ts        // Tests for ComponentB
└── Integration.spec.ts       // Integration tests
```

**Example file structure:**
```typescript
// PopupDefinitionFactory.spec.ts
import { assert } from "chai";
import { PopupDefinitionFactory } from "../PopupDefinitionFactory";

describe("PopupDefinitionFactory", () => {
  // All tests for this component
});
```

## Core Testing Philosophy

**Priority Order (follow in this sequence):**
1. Test behavior over implementation
2. Test public APIs over private methods
3. Use real objects over mocks when possible
4. Mock only external dependencies you can't control

## Test Generation Rules

### DO Generate Tests That:

1. **Focus on Observable Behavior**
   ```typescript
   // Good: Tests what the user experiences
   it("should filter map layers when slider value changes", () => {
     // Test the end result, not internal method calls
   });
   ```

2. **Use Minimal, Focused Mocks**
   ```typescript
   // Good: Only mock external dependencies
   const mapService = sinon.stub().returns(mockLayer);

   // Avoid: Mocking your own classes extensively
   ```

3. **Test Edge Cases and Error Scenarios**
   ```typescript
   it("should handle missing data gracefully", () => {
     // Test with null, undefined, empty arrays, etc.
   });
   ```

4. **Group Related Functionality**
   ```typescript
   describe("Layer Filtering", () => {
     describe("when applyToGroupContents is true", () => {
       // Related tests grouped together
     });
   });
   ```

### AVOID Generating Tests That:

1. **Test Private Implementation Details**
   ```typescript
   // Avoid: Testing private methods directly
   it("should call private initComponent method", () => {
     const spy = sinon.spy(controller, "initComponent");
   });
   ```

2. **Over-Mock Internal Logic**
   ```typescript
   // Avoid: Mocking every single dependency
   const mockThis = sinon.stub();
   const mockThat = sinon.stub();
   const mockEverything = sinon.stub();
   ```

3. **Test Framework Implementation**
   ```typescript
   // Avoid: Testing that setters set values
   it("should set property when setter is called", () => {
     controller.property = "value";
     expect(controller.property).to.equal("value");
   });
   ```

## Mock Strategy Guidelines

### When to Mock:
**Mock these types of dependencies:**
- **External APIs** (HTTP requests, databases)
- **Browser APIs** (localStorage, fetch, DOM)
- **Third-party libraries** (map services, UI frameworks)
- **Time-sensitive operations** (Date.now(), timers)
- **Non-deterministic behavior** (random numbers)
- **Expensive operations** (file I/O, network calls)

### When NOT to Mock:
**Do not mock these types of code:**
- **Your own classes and methods**
- **Simple data structures and POJOs**
- **Pure functions without side effects**
- **Synchronous, deterministic operations**

## Test Structure Template

```typescript
describe("ComponentName", () => {
  // Minimal setup - use factory methods
  let component: ComponentType;
  let mockExternalDependency: SinonStub;

  beforeEach(() => {
    // Only mock external dependencies
    mockExternalDependency = sinon.stub(ExternalService, 'method');
    component = new ComponentType(mockExternalDependency);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("Core Functionality", () => {
    it("should handle normal operation", () => {
      // Test the main use case
    });

    it("should handle edge cases", () => {
      // Test boundary conditions
    });
  });

  describe("Error Handling", () => {
    it("should handle missing data gracefully", () => {
      // Test error scenarios
    });
  });
});
```

## Factory Pattern for Test Setup

**Always prefer factory methods over inline mock creation:**

```typescript
// Good: Factory method
const testSetup = TestFactory.createComponent({
  withFeature: "customValue"
});

// Avoid: Inline mock creation
const mockA = { prop: "value" };
const mockB = { method: sinon.stub() };
const mockC = { /* ... */ };
```

## Assertion Guidelines

### Good Assertions:
```typescript
expect(result.status).to.equal("success");
expect(layers).to.have.length(3);
expect(errorHandler).to.have.been.calledWith("error message");
expect(() => component.process(invalidData)).to.not.throw();
```

### Avoid These Assertions:
```typescript
expect(spy.calledOnce).to.be.true; // Tests implementation
expect(component.privateMethod).to.exist; // Tests internals
```

## Test Naming Conventions

**Follow these naming rules:**
- Use descriptive test names that explain the scenario and expected outcome
- Start with "should" to describe expected behavior
- Include context: "when X, should Y"

```typescript
// Good names
it("should apply filters to all sublayers when applyToGroupContents is true")
it("should handle network timeout gracefully")
it("should validate input before processing")

// Poor names
it("should work")
it("test filtering")
it("handles errors")
```

## Integration vs Unit Test Guidelines

### Write Unit Tests When:
**Use unit tests for:**
- Testing a single component's behavior
- Logic is complex and needs isolation
- Fast feedback is important

### Write Integration Tests When:
**Use integration tests for:**
- Testing component interactions
- End-to-end workflows are critical
- Real-world scenarios are complex

## Test Maintenance Rules

**Follow these maintenance guidelines:**
1. **Keep tests independent** - No test should depend on another test's state
2. **Use descriptive variable names** - `userWithAdminRights` instead of `user1`
3. **One assertion per concept** - Test one thing at a time
4. **Clean up after tests** - Always restore mocks and clean state

## Code Coverage Guidelines

**Apply these coverage principles:**
- Aim for high coverage of **public APIs**
- Don't chase 100% coverage of private methods
- Focus on **critical paths** and **edge cases**
- Coverage should be a side effect of good tests, not the goal

## Performance Testing Considerations

**Follow these performance guidelines:**
- Keep unit tests fast (< 100ms each)
- Mock expensive operations in unit tests
- Use integration tests for performance validation
- Consider test parallelization for large suites

## COMMON MISTAKES TO AVOID

### NEVER Put Test Cases in all.ts
**This is the most critical mistake to avoid:**

```typescript
// WRONG - Never do this in all.ts:
import { assert } from "chai";
import { MyComponent } from "../MyComponent";

describe("MyBundle", () => {
  it("should do something", () => {
    // This test case should be in a separate .spec.ts file!
  });
});
```

```typescript
// CORRECT - all.ts should only contain imports:
import "./MyComponent.spec";
import "./AnotherComponent.spec";
```

### NEVER Create Monolithic Test Files
**Each component should have its own test file:**

```typescript
// WRONG - Don't test everything in one file:
describe("EntireBundle", () => {
  describe("ComponentA", () => { /* tests */ });
  describe("ComponentB", () => { /* tests */ });
  describe("ComponentC", () => { /* tests */ });
});
```

```typescript
// CORRECT - Separate files for each component:
// ComponentA.spec.ts
describe("ComponentA", () => { /* tests */ });

// ComponentB.spec.ts
describe("ComponentB", () => { /* tests */ });

// ComponentC.spec.ts
describe("ComponentC", () => { /* tests */ });
```

### CORRECT Test File Structure Summary

```
<bundle-name>/tests/
├── all.ts                     // ONLY imports, NO test cases
├── ComponentA.spec.ts         // Tests for ComponentA only
├── ComponentB.spec.ts         // Tests for ComponentB only
├── ComponentC.spec.ts         // Tests for ComponentC only
└── Integration.spec.ts        // Cross-component integration tests
```

**Remember: all.ts is the index file that imports all test files. It should never contain actual test cases!**

---
