/*
The MIT License (MIT)

AwesomeGrid v1.0.4

Copyright (c) 2014 M. Kamal Khan <http://bhittani.com/jquery/awesome-grid/>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

(function($){
    "use strict";

    var AwesomeGridObj = {

        _widthGrid : 0,
        _widthItem : 0,
        _ColumnsArr : [],
        _Columns : [],
        _$items : null,

        init : function(options, elem)
        {
            var self = this;
            self.elem = elem;
            self.$elem = $(elem);
            self.options = $.extend({}, $.fn.AwesomeGrid.options, options);

            self._ColumnsArr = self.sort(self.options.columns);

            self.extract();
            self.layout();

            if(self.options.responsive)
            {
                $(window).resize(function(){
                    self.extract();
                    self.layout();
                });
            }

            // listen for new items...
            self.$elem.on('ag-add', function(event, item){
                self.$elem.append(item);
                self.add_one(item);
            });
        },

        sort : function(obj)
        {
            var defaults = 2;
            var arr = [];
            var i = 0;
            $.each(obj, function(key, val){
                val = parseInt(val);
                if(parseInt(key))
                {
                    key = parseInt(key);
                    if(!i)
                    {
                        arr[i] = [];
                        arr[i][0] = key;
                        arr[i][1] = val;
                    }
                    var j = i-1;
                    while(j >= 0 && key > arr[j][0])
                    {
                        arr[j+1] = [];
                        arr[j+1][0] = arr[j][0];
                        arr[j+1][1] = arr[j][1];
                        arr[j][0] = key;
                        arr[j][1] = val;
                        j--;
                    }
                    i++;
                }
                else if(key == 'defaults')
                {
                    defaults = val;
                }
            });
            arr.push(defaults);
            return arr;
        },

        get_columns : function()
        {
            var self = this;

            var C = self._ColumnsArr;
            var columns = C[C.length - 1];
            var context = self.options.context == 'self'
            ? self.$elem.width()
            : window.innerWidth;
            for(var i = 0; i < C.length; i++)
            {
                if(C[i][0] && (context <= C[i][0]))
                {
                    columns = C[i][1];
                }
            }

            return columns;
        },

        extract : function()
        {
            var self = this;
            self._$items = $(' > ' + self.options.item, self.$elem);
            self._widthGrid = self.$elem.innerWidth();
            var columns = self.get_columns();
            var space = self.options.colSpacing;
            self._widthItem = (space + self._widthGrid - (columns * space)) / columns;
            var left = 0;
            self._Columns = [];
            for(var i = 0; i < columns; i++)
            {
                self._Columns[i] = {
                    'height' : 0,
                    'left' : left + 'px'
                };
                left += self._widthItem + self.options.colSpacing;
            }
            self.$elem.css('position', 'relative');
        },

        smallest : function()
        {
            var self = this;
            var index = 0;
            var value = self._Columns.length > 0 ? self._Columns[0].height : 0;
            for(var i = 0; i < self._Columns.length; i++)
            {
                if(self._Columns[i].height < value)
                {
                    index = i;
                    value = self._Columns[i].height;
                }
            }
            return index;
        },

        largest : function(Arr)
        {
            var self = this;
            var index = 0;
            var value = Arr[0];
            for(var i = 0; i < Arr.length; i++)
            {
                if(self._Columns[Arr[i]].height > value)
                {
                    index = i;
                    value = self._Columns[Arr[i]].height;
                }
            }
            return index;
        },

        layout : function()
        {
            var self = this;
            self._$items.each( function(index, element){
                self.add_one($(this));
            });
        },

        add_one : function(item)
        {
            var self = this;
            var top, size, I;
            if(!(self.options.hiddenClass && item.hasClass(self.options.hiddenClass)))
            {
                item.outerWidth(self._widthItem);
                I = [];
                I[0] = self.smallest();
                size = item.data('x');
                if(size)
                {
                    size = (size >= self._Columns.length) ? self._Columns.length : size;
                    item.outerWidth( (self._widthItem * size) + ((size-1)*self.options.colSpacing));
                    if((I[0] + size) >= self._Columns.length)
                    {
                        I[0] -= (I[0] + size - self._Columns.length);
                    }
                    for(var i = 1; i < size; i++)
                    {
                        I[i] = I[i-1]+1;
                    }
                }

                top = self._Columns[I[self.largest(I)]].height
                    + (self._Columns[I[self.largest(I)]].height == 0
                       ? self.options.initSpacing
                       : self.options.rowSpacing);
                item.css({
                    position : 'absolute',
                    left : self._Columns[I[0]].left,
                    top : top +'px'
                }).addClass('ag-col-'+(I[0]+1));

                for(var x = 0; x < I.length; x++)
                {
                    self._Columns[I[x]].height = top + item.outerHeight();
                    self.$elem.height(self._Columns[I[x]].height);
                }

                if(self.options.fadeIn)
                {
                    item.fadeIn('fast');
                }

                if(self.options.onReady)
                {
                    self.options.onReady(item);
                }
            }
        }

    };

    $.fn.AwesomeGrid = function(options) {
        return this.each(function(){
            var Obj = function(){
                function F(){};
                F.prototype = AwesomeGridObj;
                return new F();
            }();
            Obj.init(options, this);
        });
    };

    $.fn.AwesomeGrid.options = {
        rowSpacing  : 20,
        colSpacing  : 20,
        initSpacing : 0,
        columns     : 2,
        context     : 'window',
        responsive  : true,
        fadeIn      : true,
        hiddenClass : false,
        item        : 'li',
        onReady     : function(item){}
    };

})(jQuery);