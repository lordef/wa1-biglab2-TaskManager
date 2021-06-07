/*********************************************************************************************************
**--------------File Info---------------------------------------------------------------------------------
** File name:           TaskList.js
** Last modified Date:  2021-06-05
** Descriptions:        High level definition of TaskList object.
**--------------------------------------------------------------------------------------------------------       
*********************************************************************************************************/

function TaskList() {
  this.list = [];

  this.add = (task) => {
    if (!this.list.some(t => t.id === task.id)){
      if(task.id === undefined){
        let new_id = this.list[this.list.length-1].id + 1;
        task.id = new_id;
      }
      this.list = [...this.list, task];
    }
    else throw new Error('Duplicate id');
  };

  this.edit = (task) => {
    if (this.list.some(t => t.id === task.id)){
      let index = this.list.findIndex(t => t.id === task.id);
      this.list[index] = task;
    }
    else throw new Error('Invalid id');
  };

  this.delete = (id) => {
    this.list = this.list.filter(t => t.id !== id);
    return this.list;
  };

  this.filterAll = () => {
    // With this approach we return a copy of the list, not the list itself.
    return this.list.filter(() => true);
  }

  this.filterByImportant = () => {
    return this.list.filter((task) => task.isImportant());
  }

  this.filterByToday = () => {
    return this.list.filter((task) => task.isToday());
  }

  this.filterByNextWeek = () => {
    return this.list.filter((task) => task.isNextWeek());
  }

  this.filterByPrivate = () => {
    return this.list.filter((task) => task.isPrivate());
  }

}

export default TaskList;