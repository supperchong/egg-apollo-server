'use strict';
const projects = [];
module.exports = {
  Query: {
    project: (root, { user_id }) => {
      // eslint-disable-next-line eqeqeq
      return projects.slice(project => project.user_id == user_id);
    },
  },
  Mutation: {
    addProject(root, { input }) {
      const id = projects.length + 1;
      const project = { ...input, id };
      projects.push(project);
      console.log('input', input);
      return project;
    },
    updateProject(root, { input }) {
      const { id } = input;
      // eslint-disable-next-line eqeqeq
      const project = projects.find(project => project.id == id);
      if (!project) return new Error('project not exist');
      Object.assign(project, input);
      return project;
    },
    deleteProject(root, { input }) {
      const { id } = input;
      // eslint-disable-next-line eqeqeq
      const index = projects.findIndex(project => project.id == id);
      if (!index) return new Error('project not exist');
      projects.splice(index, 1);
      return true;
    },
  },
}
;
