/*********************************************************************************************************
**--------------File Info---------------------------------------------------------------------------------
** File name:           Task.js
** Last modified Date:  2021-06-05
** Descriptions:        High level definition of Task object.
**--------------------------------------------------------------------------------------------------------       
*********************************************************************************************************/
import dayjs from 'dayjs';


function Task(id, description, isImportant = false, isPrivate = true, deadline = '',completed = false) {
  this.id = id;
  this.description = description;
  this.important = isImportant;
  this.private = isPrivate;
  // deadline is saved as day.js object
  this.deadline = deadline && dayjs(deadline);
  this.completed = completed;

  // Getters
  this.isImportant = () => { return this.important; }
  this.isPrivate = () => { return this.private; }

  /** 
   * Function to check if a date is today. Returns true if the date is today, false otherwise.
   * @param {*} date the javascript Date to be checked
   */
  this.isToday = () => {
    const comparisonTemplate = 'YYYY-MM-DD';
    const now = dayjs();
    return this.deadline && (this.deadline.format(comparisonTemplate) === now.format(comparisonTemplate));
  }

  /** 
   * Function to check if a date is yesterday. Returns true if the date is yesterday, false otherwise.
   * @param {*} date the javascript Date to be checked
   */
  this.isYesterday = () => {
    const comparisonTemplate = 'YYYY-MM-DD';
    const yesterday = dayjs().subtract(1, 'day');
    return this.deadline && (this.deadline.format(comparisonTemplate) === yesterday.format(comparisonTemplate));
  }

  /** 
   * Function to check if a date is tomorrow. Returns true if the date is tomorrow, false otherwise.
   * @param {*} date the javascript Date to be checked
   */
  this.isTomorrow = () => {
    const comparisonTemplate = 'YYYY-MM-DD';
    const tomorrow = dayjs().add(1, 'day');
    return this.deadline && (this.deadline.format(comparisonTemplate) === tomorrow.format(comparisonTemplate));
  }

  /**
   * Function to check if a date is in the next week. Returns true if the date is in the next week, false otherwise.
   * @param {*} date the javascript Date to be checked
   */
  this.isNextWeek = () => {
    const tomorrow = dayjs().add(1, 'day');
    const nextWeek = dayjs().add(7, 'day');
    const ret = this.deadline && (!this.deadline.isBefore(tomorrow, 'day') && !this.deadline.isAfter(nextWeek, 'day'));
    return ret;
  }

  this.formatDeadline = () => {
    // if (!this.deadline) return '--o--';
    if (!this.deadline) return '     ';
    else if (this.isToday(this.deadline)) {
      return this.deadline.format('[Today at] HH:mm');
    } else if (this.isTomorrow(this.deadline)) {
      return this.deadline.format('[Tomorrow at] HH:mm');
    } else if (this.isYesterday(this.deadline)) {
      return this.deadline.format('[Yesterday at] HH:mm');
    } else {
      return this.deadline.format('dddd DD MMMM YYYY [at] HH:mm');
    }
  }
}

export {Task};