# Cedar Authorization Model Documentation

## Overview
This authorization model implements a role-based access control system for projects using Cedar policies. It defines the relationships between users, projects, and their associated permissions.

## Entity Types

### User Entity
Represents system users who can interact with projects.
- **Attributes**:
  - `id`: Implicit unique identifier

### Project Entity
Represents projects in the system with configurable access levels.
- **Attributes**:
  - `visibility`: Access control level
    - `public`: Accessible to all users
    - `authenticated`: Accessible to logged-in users only
    - `private`: Accessible only to owner
  - `owner`: Reference to User ID who owns the project
  - `id`: Implicit unique identifier

```typescript
entityTypes: {
    User: {
        shape: { 
            type: 'Record', 
            attributes: {} 
        },
        memberOfTypes: [],
    },
    Project: {
        shape: { 
            type: 'Record', 
            attributes: {
                visibility: { type: 'String', required: false },
                owner: { type: 'String', required: false },
            } 
        },
        memberOfTypes: [],
    },
}
```

## Context Types

### ActionContext
Provides additional authorization context for action evaluation.
- **Attributes**:
  - `internalAccess`: Boolean flag for system-level operations
  - Used to override normal authorization rules when needed

```typescript
commonTypes: {
    ActionContext: {
        type: 'Record',
        attributes: {
            internalAccess: { type: 'Boolean', required: false }
        }
    }
}
```

## Actions

### Project Operations
All actions require a User principal and operate on Project resources.

**Read Operations**
- `read`: Access single project details
  - Requires: Project visibility check or ownership
- `list`: Query multiple projects
  - Filters: Based on visibility and ownership rules

**Write Operations**
- `create`: Create new projects
  - Default owner: Creating user
- `update`: Modify project properties
  - Restricted to: Project owner
- `delete`: Remove projects
  - Restricted to: Project owner

```typescript
actions: {
    read: {
        appliesTo: {
            context: { type: 'ActionContext' },
            resourceTypes: ['Project'],
            principalTypes: ['User']
        }
    },
    // ... other actions following same pattern
}
```

## Authorization Policies

### Project Access Policy
```cedar
permit(
    principal in User,
    action in [read, list],
    resource in Project
)
when {
    resource.visibility = "public" ||
    resource.owner = principal.id
};
```

**Policy Rules**:
- Public projects are accessible to all users
- Private projects are only accessible to their owners
- Authenticated projects require a valid user session

## Usage Examples

### Read Authorization Check
```typescript
const readCheck = {
    principal: { type: 'App::User', id: 'user123' },
    action: { type: 'App::Action', id: 'read' },
    resource: { 
        type: 'App::Project', 
        id: 'project456',
        attrs: {
            visibility: 'private',
            owner: 'user123'
        }
    },
    context: { internalAccess: false }
};
```

### System Override Example
```typescript
const systemCheck = {
    // ... same as above but with
    context: { internalAccess: true }
};
```

This enhanced documentation provides better context, clearer examples, and a more logical flow from basic concepts to practical usage.