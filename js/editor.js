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

var Logi = {};

Logi.Editor = Class({
    
    canvas: null,
    
    __construct: function(area_selector) {
        this.canvas = d3.select(area_selector)
                        .append('svg')
                        .attr('width', 1000)
                        .attr('height', 1000);
                        
        this.canvas.on('click', function() {
            console.info('Canvas.click');
        });
    }
});