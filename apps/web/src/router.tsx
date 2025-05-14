import { routeTree } from './routeTree.gen'
import { fetchProjects } from './utils/fetchProjects'

// Use your routerContext to create a new router
// This will require that you fullfil the type requirements of the routerContext
const router = createRouter({
  routeTree,
  context: {
    // Supply the fetchPosts function to the router context
    fetchProjects,
  },
})
