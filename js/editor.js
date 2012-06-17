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
function Class(child, parent) {
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
    }

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