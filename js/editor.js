// fetches the document for the given embedding_element
function get_sub_document(embed) {
    if (embed.contentDocument) {
        return embed.contentDocument;
    }
    
    var subdoc = null;
    try {
        subdoc = embed.getSVGDocument();
    } catch(e) {}

    return subdoc;
}

/*
 * Создание нового "класса".
 *
 * @link http://dklab.ru/chicken/nablas/40.html
 */
function create_class(child, parent) {
    var new_class = function() {
        /* Если идёт только объявление нового класса, */
        if (new_class.__defining_class__) {
            /* сохраняем родительский класс */
            this.__parent = new_class.prototype;
            /* И выходим */
            return;
        }

        /* Если задан метод-конструктор класса */
        if (new_class.__constructor__) {
            /* Устанавливаем конструктор объекта на функцию класса */
            this.constructor = new_class;
            /* И вызываем метод-конструктор */
            new_class.__constructor__.apply(this, arguments);
        }
    };    

    /* Устанавливаем пустой объект прототипом нового класса */
    new_class.prototype = {};

    /* Если задан родительский класс, */
    if (parent) {
        /* устанавливаем флаг, обозначающий объвление класса */
        parent.__defining_class__ = true;
        /* Устанавливаем в качестве прототипа объект родительского класса */
        new_class.prototype = new parent();
        /* И снимаем флаг */
        delete parent.__defining_class__;

        /* Задаём оригинальный конструктор для родителя */
        new_class.prototype.constructor = parent;
        /* И устанавливаем в качестве метода-конструктора конструктор объекта */
        new_class.__constructor__ = parent;
    }

    /* Название метода-конструктор класса */
    var constr_name = '__construct';

    /* Если задан объект со свойствами нового класса */
    if (child)
    {
        /* Копируем свойства в сам класс */
        for (var prop in child) {
            new_class.prototype[prop] = child[prop];
        }

        /* Если задан метод-конструктор, */
        if (child[constr_name] && Object != child[constr_name]) {
            /* запоминаем его */
            new_class.__constructor__ = child[constr_name];
        }
    }

    return new_class;
}

function Class(new_class) {
	return create_class(new_class);
}

function ClassExtends(parent_class, new_class) {
	return create_class(new_class, parent_class);
}

function wrap_ctx(obj, func) {
    return function() {
        var args = Array.prototype.slice.call(arguments, 0);
        args.unshift(this);
        return func.apply(obj, args);
    };        
}

/*
 * Класс выборки для выполнения отложенных действий. Дублирует основные методы 
 * d3, но не выполняет их вызовы сразу, а записывает в список действий, после 
 * чего можно запустить их выполнение c помощью метода execute().
 */
function LaterSelection(selection) {
    var self = this;
    
    this._selection = selection;
    this._stack = [];
    
    this.transition = function() {
        var transition = new LaterTransition(self);
        self.push(transition);
        return transition;
    };
    
    this.attr = function(attr, value) {
        var attr = new LaterAttr(attr, value);
        self.push(attr);
        return self;
    };
    
    this.style = function(name, value) {
        var style = new LaterStyle(name, value);
        self.push(style);
        return self;
    };
    
    this.selection = function() {
        return self._selection;
    };
    
    this.push = function(action) {
        self._stack.push(action);
    };
    
    this.execute = function() {
        var retval = self._selection,
            action;
        
        for (var idx in self._stack) {
            action = self._stack[idx];
            retval = action.execute(retval);
        }
        
        return retval;
    };
}

/*
 * Класс, для выполнения отложенных анимаций с помощью d3.
 */
function LaterTransition(selection) {
    var self = this;
    
    this._selection = selection;
    this._stack = [];
    
    this.attr = function(attr, value) {
        return self._selection.attr(attr, value);
    };
    
    this.style = function(name, value) {
        return self._selection.style(name, value);
    };
    
    this.selection = function() {
        return self._selection.selection();
    };
    
    this.execute = function(selection) {
        return selection.transition();
    };
}

/*
 * Класс, представляющий отложенное действие по изменению атрибута элементов 
 * выборки.
 */
function LaterAttr(attr, value) {
    var self = this;
    
    this._attr = attr;
    this._value = value;
    
    this.execute = function(selection) {
        return selection.attr(self._attr, self._value);
    };
}

/*
 * Класс для отложенного изменение стиля.
 */
function LaterStyle(name, value) {
    var self = this;
    
    this._name = name;
    this._value = value;
    
    this.execute = function(selection) {
        return selection.style(self._name, self._value);
    };
}

/* 
 * Расширение прототипа d3 для добавления функции-моста, чтобы создавать 
 * отложенные действия. Принимает в качестве аргумента ссылку на объект caller,
 * в который будет помещен список отложенных вызовов, а также метод для их 
 * запуска - caller.execute(). Один и тот же объект можно передавать в разные 
 * вызовы d3.selection.later(), чтобы создавать таким образом группы отложенных 
 * вызовов для нескольких различных наборов элементов, которые должны будут 
 * запуститься одновременно.
 */
d3.selection.prototype.later = function(caller) {
    var selection = new LaterSelection(this);
    
    if (caller.execute == undefined) {
        caller.actions = [];
        caller.execute = function() {
            var action;
            for (var idx in this.actions) {
                action = this.actions[idx];
                action.call();
            }
        }
    }
    
    caller.actions.push(selection.execute);
    return selection;
};

var Logi = {};

Logi.Editor = Class({
    
    canvas: null,
    
    window: null,
    
    elements_group: null,
    
    __construct: function(area_selector) {
        this.window = d3.select(window);
        this.canvas = d3.select(area_selector)
                        .append('svg')
                        .attr('width', 1000)
                        .attr('height', 1000);
                        
        this.elements_group = this.canvas.append('g')
                                         .attr('id', 'elements');
                   
        this.canvas.on('dblclick', wrap_ctx(this, this.create_element));
        
        //console.info('SVG canvas width', this.canvas.node().clientWidth);
        //console.info('SVG canvas height', this.canvas.node().clientHeight);
    },
    
    create_element: function(dom_elem) {
        if (d3.event.target != this.canvas.node()) {
            return;
        }
        
        var point = d3.mouse(this.canvas.node());
        
        var elem = new Logi.Element.SimpleAction(this);
        elem.move(point[0], point[1]);
    }
    
});

Logi.Element = {};
Logi.Element.Abstract = Class({
    
    editor: null,
    
    element: null,
    
    window: null,
    
    drag_origin: null,
        
    __construct: function(editor) {
        this.editor = editor;
        
        this.element = this.render_element(this.editor.elements_group);
        this.element.on('mousedown', wrap_ctx(this, this.drag_start));
    },
    
    render_element: function(elements) {
        var elem = elements.append('rect');
        elem.classed('element', true)
            .attr('x', 5)
            .attr('y', 5)
            .attr('width', 100)
            .attr('height', 100);
        
        return elem;
    },
    
    move: function(dx, dy) {
        var elem = this.element.node();
        var parent = elem.parentNode;
        
        var matrix = elem.getTransformToElement(parent);
        matrix = matrix.translate(dx, dy);
        
        var m = matrix;
        var m = [m.a, m.b, m.c, m.d, m.e, m.f];
        this.element.attr('transform', 'matrix(' + m.join(', ') + ')');
    },
    
    drag_point: function() {
        var point = d3.mouse(this.element.node().parentNode);
        return {x: point[0], y: point[1]};
    },
            
    drag_start: function () {
        this.drag_origin = this.drag_point();
        //console.info('Element drag start', this.drag_origin);
    
        var win = this.editor.window;
        win.on('mousemove.drag', wrap_ctx(this, this.drag_move))
           .on('mouseup.drag', wrap_ctx(this, this.drag_stop));
    },
    
    drag_move: function() {
        var point = this.drag_point();
        var dx = point.x - this.drag_origin.x;
        var dy = point.y - this.drag_origin.y;
        
        /*
         * @todo: Do not allow to move elements outside canvas.
         */
        this.move(dx, dy);
        
        //console.info('Element drag move, dx:', dx, 'dy:', dy);
        this.drag_origin = point;
    },
    
    drag_stop: function() {
        this.drag_origin = null;
        
        var win = this.editor.window;
        win.on('mousemove.drag', null)
           .on('mouseup.drag', null);
    }
    
});

Logi.Element.SimpleAction = ClassExtends(Logi.Element.Abstract, {
	
    render_element: function(elements) {
        var align_label = {};
        var label_padding = {left: 5, top: 0};
        
        var elem = elements.append('g')
                           .attr('class', 'element');
        
        elem.append('rect')
            .attr('class', 'box')
            .attr('width', 100)
            .attr('height', 100);
        
        var label = elem.append('text')
                        .attr('class', 'label')
                        .text('Д'); 
                        
        label.later(align_label)
             .attr('x', function() { return label_padding.left; })
             .attr('y', function() { return label_padding.top; });
        
        var bbox = label.node().getBBox();
        label_padding.top += bbox.height;
        
        align_label.execute();
        return elem;
    }
    
})

Logi.Element.CompoundAction = ClassExtends(Logi.Element.Abstract, {
	
    //
    
})