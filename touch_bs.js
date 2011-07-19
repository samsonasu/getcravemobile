//Brian Samson Sencha Touch utility functions
var TouchBS = {};

Date.patterns = {
  ShortSlashes: "Y/m/d",
  ISO8601Long:"Y-m-d H:i:s",
  ISO8601Short:"Y-m-d",
  ShortDate: "n/j/Y",
  LongDate: "l, F d, Y",
  FullDateTime: "l, F d, Y g:i:s A",
  MonthDay: "F d",
  ShortTime: "g:i A",
  LongTime: "g:i:s A",
  Time24: "H:i:s",
  SortableDateTime: "Y-m-d\\TH:i:s",
  UniversalSortableDateTime: "Y-m-d H:i:sO",
  MysqlRailsNoTZ:  "Y-m-d\\TH:i:s\\Z",
  YearMonth: "F, Y",
  MSSQL: "Y/m/d H:i:s O"
};

TouchBS.get_date = function(date) {
   if (!date){
      return null;
   }

   if (date instanceof Date) {
      return date;
   } else {
      var d = null;
      for (var pattern in Date.patterns) {
          if (Date.patterns.hasOwnProperty(pattern)) {
             d = Date.parseDate(date, Date.patterns[pattern]);
             if (d instanceof Date){
                break;
             }
          }
      }
      return d;
   }
};

//based on http://ejohn.org/blog/javascript-pretty-date/
TouchBS.pretty_date = function(date) {
  if (!(date instanceof Date)) {
    date = TouchBS.get_date(date);
  }
  var diff = (((new Date()).getTime() - date.getTime()) / 1000);
  var day_diff = Math.floor(diff / 86400);
  
  if (day_diff <= 0) return "Today" //time zones can cause the date to appear in the future
  else if (day_diff === 1) return "Yesterday"
  else if (day_diff < 8) return day_diff + " days ago"
  else if (day_diff < 31) return Math.ceil( day_diff / 7 ) + " weeks ago"
  else if (day_diff < 365) return Math.ceil(day_diff / 30) + " months ago"
  else return "Older"
}


// Sencha touch has a serious bug in the mapping between stores and grouped lists
// this is taken from here: 
// http://www.sencha.com/forum/showthread.php?135533-OPEN-TOUCH-138-Serious-flaw-with-List-Selection-(revised)&s=357ef603e36a51372ae1ed131a71a630
Ext.override(Ext.List, {
  displayIndexToRecordIndex: function (targetIndex) {
    if (this.grouped) {
      var groups = this.getStore().getGroups();
      
      for (var g = 0; g < groups.length; g++) {
        var group = groups[g].children;
        
        if (targetIndex < group.length)
          return this.getStore().indexOf(group[targetIndex]);
          
        targetIndex -= group.length;
      }  
    }
    else
      return targetIndex;
  },

  recordIndexToDisplayIndex: function (targetIndex) {
    if (this.grouped) {
      var rec = this.getStore().getAt(targetIndex);

      var groups = this.getStore().getGroups();
      var currentIndex = 0;
      
      for (var g = 0; g < groups.length; g++) {
        var group = groups[g].children;
        
        for (var i = 0; i < group.length; i++)
          if (group[i] == rec)
            return currentIndex;
          else
            currentIndex++;
      }  
    }
    else
      return targetIndex;
  }
});