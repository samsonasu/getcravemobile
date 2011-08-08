//Brian Samson Sencha Touch utility functions
var TouchBS = {};

TouchBS.handle_failure = function() {
  //TODO add error messages and such
  TouchBS.stop_waiting();
  Ext.Msg.alert("Opps", "Sorry, something went wrong.");
}

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
      if (date[date.length-1] === 'Z') {
        //UTC time in the db, but javascript will think that is in localtime, so we need to
        //subtract the current localtime offset (which is in minutes)
        //this will give us the real time with the right local tz offset
        var real_date = new Date(d.getTime() - (d.getTimezoneOffset() * 60 * 1000));
        return real_date;
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


//taken from http://snippets.dzone.com/posts/show/2426
TouchBS.rails_serializer = {
 
  serialize : function(object) {
    var values = []; 
    var prefix = '';
    
    values = this.recursive_serialize(object, values, prefix);
    
    var param_string = values.join('&');
    return param_string;
  },
  
  recursive_serialize : function(object, values, prefix) {
    for (var key in object) {
      if (typeof object[key] == 'object') {
        
        if (prefix.length > 0) {
          prefix += '['+key+']';         
        } else {
          prefix += key;
        }
        
        values = this.recursive_serialize(object[key], values, prefix);
        
        var prefixes = prefix.split('[');
        
        if (prefixes.length > 1) {
          prefix = prefixes.slice(0,prefixes.length-1).join('[');
        } else {
          prefix = prefixes[0];
        }
        
      } else {
        var value = encodeURIComponent(object[key]);
        var prefixed_key;
        if (prefix.length > 0) {
          prefixed_key = prefix+'['+key+']'          
        } else {
          prefixed_key = key
        }
        prefixed_key = encodeURIComponent(prefixed_key);
        if (value) values.push(prefixed_key + '=' + value);
      }
    }
    return values;
  }
}

//There is a bug in pullrefresh that sometimes happens if the list is rendered into a hidden panel
//and loaded while hidden.  It will think its element height is 0 so the pull refresh won't "stick" while
//reloading.  I added a check for that when the list updates, which happens when it becomes visible
Ext.override(Ext.plugins.PullRefreshPlugin, {
    onListUpdate: function() {
      if (!this.rendered) {
          this.render();
      }

      this.list.getTargetEl().insertFirst(this.el);
      if (this.pullHeight === 0) {
        this.pullHeight = this.el.getHeight();
      }

      if (!this.refreshFn) {
          this.onLoadComplete.call(this);
      }
  }
});

TouchBS.get_address_component_type = function(address_components, type) {
  for (var j=0; j < address_components.length; j++) {
    var address_component = address_components[j];
    if (address_component.types[0] === type) {
      //bingo
      return address_component;
    }
  }
  
  return null;
}

TouchBS.wait = function(msg) {
  Ext.getBody().mask(msg, 'x-mask-loading');
};

TouchBS.stop_waiting = function() {
  Ext.getBody().unmask();
};


/**
 * Clone Function
 * @param {Object/Array} o Object or array to clone
 * @return {Object/Array} Deep clone of an object or an array
 * @author Ing. Jozef Sakalos
 *
 * from: http://www.yui-ext.com/forum/showthread.php?p=238787
 */
TouchBS.clone = function(o) {
    if(!o || 'object' !== typeof o) {
        return o;
    }
    if('function' === typeof o.clone) {
        return o.clone();
    }
    var c = '[object Array]' === Object.prototype.toString.call(o) ? [] : {};
    var p, v;
    for(p in o) {
        if(o.hasOwnProperty(p)) {
            v = o[p];
            if(v && 'object' === typeof v) {
                c[p] = TouchBS.clone(v);
            }
            else {
                c[p] = v;
            }
        }
    }
    return c;
}; // eo function clone

TouchBS.formatted_phone_number = function(phone) {
  phone = String(phone);
  if (phone.length === 10) {
    return "(" + phone.substring(0,3) + ") " + phone.substring(3,6) + "-" + phone.substring(6,10);
  } else if (phone.length === 7) {
    return phone.substring(0,3) + "-" + phone.substring(3,7);
  } else {
    return phone;
  }
};

//I use these 2 lines instead of Ext.Viewport.init beacuse on iphone it is all wigged out
//because it's trying to do a bunch of crazy stuff to fix blackberry and galaxy tab
//PS sencha touch is garbage
if (Ext.is.iOS) {
  Ext.Viewport.init = function(fn, scope) {
    var me = this;

    me.updateOrientation();

    this.initialHeight = window.innerHeight;
    this.initialOrientation = this.orientation;
    if (!PhoneGap) {
      this.scrollToTop();
    }
    if (fn) {
        fn.apply(scope || window);
    }
    return; 
  };
}