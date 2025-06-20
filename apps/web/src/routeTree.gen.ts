/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { Route as rootRouteImport } from './routes/__root'
import { Route as ProjectsRouteImport } from './routes/projects'
import { Route as AdministrationRouteImport } from './routes/administration'
import { Route as AboutRouteImport } from './routes/about'
import { Route as IndexRouteImport } from './routes/index'
import { Route as ProjectsProjectIdRouteImport } from './routes/projects_.$projectId'

const ProjectsRoute = ProjectsRouteImport.update({
  id: '/projects',
  path: '/projects',
  getParentRoute: () => rootRouteImport,
} as any)
const AdministrationRoute = AdministrationRouteImport.update({
  id: '/administration',
  path: '/administration',
  getParentRoute: () => rootRouteImport,
} as any)
const AboutRoute = AboutRouteImport.update({
  id: '/about',
  path: '/about',
  getParentRoute: () => rootRouteImport,
} as any)
const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)
const ProjectsProjectIdRoute = ProjectsProjectIdRouteImport.update({
  id: '/projects_/$projectId',
  path: '/projects/$projectId',
  getParentRoute: () => rootRouteImport,
} as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/about': typeof AboutRoute
  '/administration': typeof AdministrationRoute
  '/projects': typeof ProjectsRoute
  '/projects/$projectId': typeof ProjectsProjectIdRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/about': typeof AboutRoute
  '/administration': typeof AdministrationRoute
  '/projects': typeof ProjectsRoute
  '/projects/$projectId': typeof ProjectsProjectIdRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/about': typeof AboutRoute
  '/administration': typeof AdministrationRoute
  '/projects': typeof ProjectsRoute
  '/projects_/$projectId': typeof ProjectsProjectIdRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/about'
    | '/administration'
    | '/projects'
    | '/projects/$projectId'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/about' | '/administration' | '/projects' | '/projects/$projectId'
  id:
    | '__root__'
    | '/'
    | '/about'
    | '/administration'
    | '/projects'
    | '/projects_/$projectId'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AboutRoute: typeof AboutRoute
  AdministrationRoute: typeof AdministrationRoute
  ProjectsRoute: typeof ProjectsRoute
  ProjectsProjectIdRoute: typeof ProjectsProjectIdRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/about': {
      id: '/about'
      path: '/about'
      fullPath: '/about'
      preLoaderRoute: typeof AboutRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/administration': {
      id: '/administration'
      path: '/administration'
      fullPath: '/administration'
      preLoaderRoute: typeof AdministrationRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/projects': {
      id: '/projects'
      path: '/projects'
      fullPath: '/projects'
      preLoaderRoute: typeof ProjectsRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/projects_/$projectId': {
      id: '/projects_/$projectId'
      path: '/projects/$projectId'
      fullPath: '/projects/$projectId'
      preLoaderRoute: typeof ProjectsProjectIdRouteImport
      parentRoute: typeof rootRouteImport
    }
  }
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AboutRoute: AboutRoute,
  AdministrationRoute: AdministrationRoute,
  ProjectsRoute: ProjectsRoute,
  ProjectsProjectIdRoute: ProjectsProjectIdRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()
