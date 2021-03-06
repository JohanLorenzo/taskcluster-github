const TcYaml = require('../src/tc-yaml');
const assume = require('assume');

suite('tc-yaml_test.js', function() {
  suite('VersionOne', function() {
    const tcyaml = TcYaml.instantiate(1);
    const cfg = {
      taskcluster: {
        schedulerId: 'test-sched',
      },
    };

    test('compileTasks with no tasks', function() {
      const config = {
        tasks: [],
      };
      tcyaml.compileTasks(config, cfg, {});
      assume(config.tasks).to.deeply.equal([]);
    });

    test('compileTasks with one task sets default properties', function() {
      const config = {
        tasks: [{}],
      };
      tcyaml.compileTasks(config, cfg, {});
      assume(config.tasks).to.deeply.equal([{
        taskId: config.tasks[0].taskId,
        task: {
          taskGroupId: config.tasks[0].taskId, // matches taskId
          schedulerId: 'test-sched',
        },
      }]);
    });

    test('compileTasks with two tasks sets default properties', function() {
      const config = {
        tasks: [{}, {}],
      };
      tcyaml.compileTasks(config, cfg, {});
      // taskGroupIds match
      assume(config.tasks[0].task.taskGroupId).to.equal(config.tasks[1].task.taskGroupId);
      // taskIds don't
      assume(config.tasks[0].taskId).to.not.equal(config.tasks[1].taskId);
      // taskGroupId does not match any taskId
      assume(config.tasks[0].taskId).to.not.equal(config.tasks[0].task.taskGroupId);
      assume(config.tasks[1].taskId).to.not.equal(config.tasks[1].task.taskGroupId);
    });

    test('compileTasks forces schedulerId, but uses user-supplied taskId/taskGroupId', function() {
      const config = {
        tasks: [{
          taskId: 'task-1',
          taskGroupId: 'tgid-1',
          schedulerId: 'my-scheduler-id',
        }, {
          taskId: 'task-2',
          taskGroupId: 'tgid-2',
          schedulerId: 'my-scheduler-id',
        }],
      };
      tcyaml.compileTasks(config, cfg, {});
      assume(config.tasks).to.deeply.equal([{
        taskId: 'task-1',
        task: {
          taskGroupId: 'tgid-1',
          schedulerId: 'test-sched',
        },
      }, {
        taskId: 'task-2',
        task: {
          taskGroupId: 'tgid-2',
          schedulerId: 'test-sched',
        },
      }]);
    });
  });
});
