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
 * �������� ������ "������".
 *
 * @link http://dklab.ru/chicken/nablas/40.html
 */
function Class(child, parent) {
    var new_class = function() {
        /* ���� ��� ������ ���������� ������ ������, */
        if (new_class.__defining_class__) {
            /* ��������� ������������ ����� */
            this.__parent = new_class.prototype;
            /* � ������� */
            return;
        }

        /* ���� ����� �����-����������� ������ */
        if (new_class.__constructor__) {
            /* ������������� ����������� ������� �� ������� ������ */
            this.constructor = new_class;
            /* � �������� �����-����������� */
            new_class.__constructor__.apply(this, arguments);
        }
    }     

    /* ������������� ������ ������ ���������� ������ ������ */
    new_class.prototype = {};

    /* ���� ����� ������������ �����, */
    if (parent) {
        /* ������������� ����, ������������ ��������� ������ */
        parent.__defining_class__ = true;
        /* ������������� � �������� ��������� ������ ������������� ������ */
        new_class.prototype = new parent();
        /* � ������� ���� */
        delete parent.__defining_class__;

        /* ����� ������������ ����������� ��� �������� */
        new_class.prototype.constructor = parent;
        /* � ������������� � �������� ������-������������ ����������� ������� */
        new_class.__constructor__ = parent;
    }

    /* �������� ������-����������� ������ */
    var constr_name = '__construct';

    /* ���� ����� ������ �� ���������� ������ ������ */
    if (child)
    {
        /* �������� �������� � ��� ����� */
        for (var prop in child) {
            new_class.prototype[prop] = child[prop];
        }

        /* ���� ����� �����-�����������, */
        if (child[constr_name] && Object != child[constr_name]) {
            /* ���������� ��� */
            new_class.__constructor__ = child[constr_name];
        }
    }

    return new_class;
}

function wrap_ctx(obj, func) {
    return function() {
        var args = Array.prototype.slice.call(arguments, 0);
        args.unshift(this);
        return func.apply(obj, args);
    }         
}

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
                   
        this.canvas.on('click', wrap_ctx(this, this.create_element));
    },
    
    create_element: function(dom_elem) {
        if (d3.event.target != this.canvas.node()) {
            return;
        }
        var elem = new Logi.Element(this);
    }
    
});

Logi.Element = Class({
    
    editor: null,
    
    element: null,
    
    window: null,
    
    drag_origin: null,
        
    __construct: function(editor) {
        this.editor = editor;
        
        this.element = this.editor.elements_group.append('rect');
        this.element.classed('element', true)
                    .attr('x', 5)
                    .attr('y', 5)
                    .attr('width', 100)
                    .attr('height', 100);
            
        this.element.on('mousedown', wrap_ctx(this, this.drag_start));
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
        
        var x = this.element.attr('x') * 1;
        var y = this.element.attr('y') * 1;
        this.element.attr('x', x + dx)
                    .attr('y', y + dy);
        
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