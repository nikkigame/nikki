$(document).ready(function () {
	var mine = loadFromStorage();
	drawFilter();
	switchCate(0);
	updateSize(mine);
});

var clothes = function() {
  var ret = [];
  for (var i in wardrobe) {
    ret.push(retClothes(wardrobe[i]));
  }
  return ret;
}();

function retClothes(csv){
	return {
		own: false,
		name: csv[0],
		type: csv[1],
		mainType: csv[1].split('-')[0],
		id: csv[2],
	}
}

var CATEGORY_HIERARCHY = function () {
	var ret = {};
	for (var i in category) {
		var type = category[i].split('-')[0];
		if (!ret[type]) {
			ret[type] = [];
		}
		ret[type].push(category[i]);
	}
	return ret;
}
();

/*check cookie for own clothes - start*/

function updateSize(mine) {
	$("#myClothes").val(mine.serialize());
	var subcount = {};
	for (c in mine.mine) {
		var type = c.split('-')[0];
		if (!subcount[type]) {
			subcount[type] = 0;
		}
		subcount[type] += mine.mine[type].length;
	}
	for (c in subcount) {
		$("#" + c + ">a span").text(subcount[c]);
	}
}

function MyClothes() {
  return {
    mine: {},
    size: 0,
    filter: function(clothes) {
      this.mine = {};
      this.size = 0;
      for (var i in clothes) {
        if (clothes[i].own) {
          var type = clothes[i].mainType;
          if (!this.mine[type]) {
            this.mine[type] = [];
          }
          this.mine[type].push(clothes[i].id);
          this.size ++;
        }
      }
    },
    serialize: function() {
      var txt = "";
      for (var type in this.mine) {
        txt += type + ":" + this.mine[type].join(',') + "|";
      }
      return txt;
    },
    deserialize: function(raw) {
      var sections = raw.split('|');
      this.mine = {};
      this.size = 0;
      for (var i in sections) {
        if (sections[i].length < 1) {
          continue;
        }
        var section = sections[i].split(':');
        var type = section[0];
        this.mine[type] = section[1].split(',');
        this.size += this.mine[type].length;
      }
    },
    update: function(clothes) {
      var x = {};
      for (var type in this.mine) {
        x[type] = {};
        for (var i in this.mine[type]) {
          var id = this.mine[type][i];
          x[type][id] = true;
        }
      }
      for (var i in clothes) {
        clothes[i].own = false;
        var t = clothes[i].mainType;
        var id = clothes[i].id;
        if (x[t] && x[t][clothes[i].id]) {
          clothes[i].own = true;
        }
      }
    }
  };
}

function load(myClothes) {
  var cs = myClothes.split(",");
  for (var i in clothes) {
    clothes[i].own = false;
    if (cs.indexOf(clothes[i].name) >= 0) {
      clothes[i].own = true;
    }
  }
  var mine = MyClothes();
  mine.filter(clothes);
  return mine;
}

function loadNew(myClothes) {
  var mine = MyClothes();
  mine.deserialize(myClothes);
  mine.update(clothes);
  return mine;
}

function loadFromStorage() {
  var myClothes;
  var myClothesNew;
  if (localStorage) {
    myClothesNew = localStorage.myClothesNew;
    myClothes = localStorage.myClothes;
  } else {
    myClothesNew = getCookie("mine2");
    myClothes = getCookie("mine");
  }
  if (myClothesNew) {
    return loadNew(myClothesNew);
  } else if (myClothes) {
    return load(myClothes);
  }
  return MyClothes();
}

function getCookie(c_name) {
  if (document.cookie.length>0) { 
    c_start=document.cookie.indexOf(c_name + "=")
    if (c_start!=-1) { 
      c_start=c_start + c_name.length+1 
      c_end=document.cookie.indexOf(";",c_start)
      if (c_end==-1) {
        c_end=document.cookie.length
      }
      return unescape(document.cookie.substring(c_start,c_end))
    }
  }
  return "";
}

/*check cookie for own clothes - end*/

function drawFilter() {
	out = "<ul class='nav nav-tabs nav-justified' id='categoryTab'>";
	for (var c in CATEGORY_HIERARCHY) {
		out += '<li id="' + c + '"><a href="javascript:void(0)" onClick="switchCate(\'' + c + '\')">' + c + '&nbsp;&nbsp;<span class="badge">0</span></a></li>';
	}
	out += "</ul>";
	$('#category_container').html(out);
}

function switchCate(c) {
	$("#searchResultList").html('');
	var currentCategory = c;
	$("ul#categoryTab li").removeClass("active");
	$("#category_container div").removeClass("active");
	$("#" + c).addClass("active");
	$("#category-" + c).addClass("active");
	rebuildCate(currentCategory);
	return false;
}

function rebuildCate(currentCategory){
	var ret = [];
	for (var i in clothes){
		if (clothes[i].mainType != currentCategory) continue;
		if (!clothes[i].own) continue;
		ret.push([clothes[i].id,clothes[i].name]);
	}
	ret.sort(function(a,b){return a[0] - b[0]});
	
	var check_container_left='';
	var check_container_right='';
	var tmp='';
	for (var i in ret){
		tmp = ret[i][0] + '&nbsp;' + ret[i][1] + '<br>'; // '&#9;&#9;';
		if (i%2>0) check_container_right += tmp;
		else check_container_left += tmp;
	}
	$("#check_container_left").html(check_container_left);
	$("#check_container_right").html(check_container_right);
}
