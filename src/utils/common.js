import cloneDeep from 'lodash/cloneDeep';

const common = {
  /**
   * JSONをコピーする
   * @param {JSON} data コピーしようとするJSONデータ
   */
  clone: function(data) {
    return cloneDeep(data);
  },

  /**
   * 数字をカンマ区切りで表示
   * @param {Integer} num 数字
   */
  toNumComma: (num) => {
    if (num === null || num === undefined) {
      return '';
    } else {
      const int_comma = (num + "").replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
      return int_comma;
    }
  },

  /**
   * オブジェクトは空白なのか
   * @param {Object} obj 
   */
  isEmpty: (obj) => {
    if (obj === null || obj === undefined || obj === '') {
      return true;
    } else if (Array.isArray(obj)) {
      return obj.length === 0;
    } else if (typeof obj === 'number') {
      return false;
    }
    for(let key in obj) {
      if(Object.prototype.hasOwnProperty.call(obj, key))
        return false;
    }
    return true;
  },

  /**
   * JSONかどうかを判定する関数
   * @param {Object} arg 
   */
  isJSON: function(arg) {
    // typeof null === "object"
    return arg !== null && typeof arg === 'object';
  },

  /**
   * 文字列をフォーマットする
   * @param {String} format 
   *
   * 使用方法：utils.format('This is argument: %s', arg1);
   */
  formatStr: function(format) {
    if (!format) {
      return null;
    } else {
      var i = 0,
        j = 0,
        r = "",
        next = function(args){
          j += 1; i += 1;
          return args[j] !== void 0 ? args[j] : "";
        };

      for(i=0; i<format.length; i++){
        if(format.charCodeAt(i) === 37){
          switch(format.charCodeAt(i+1)){
            case 115: r += next(arguments); break;
            case 100: r += Number(next(arguments)); break;
            default: r += format[i]; break;
          }
        } else {
          r += format[i];
        }
      }
      return r;
    }
  },

  /**
   * 日付をフォーマットする
   * @param {Date} date 
   * @param {String} format 
   */
  formatDate: function (date, format) {
    if (!format) {
        format = 'YYYY-MM-DD hh:mm:ss.SSS';
    }
    if (!date) {
      return null;
    } else if (typeof date === "string") {
        date = new Date(date);
    }
    format = format.replace(/YYYY/g, date.getFullYear());
    format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
    format = format.replace(/DD/g, ('0' + date.getDate()).slice(-2));
    format = format.replace(/hh/g, ('0' + date.getHours()).slice(-2));
    format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
    format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
    if (format.match(/S/g)) {
        var milliSeconds = ('00' + date.getMilliseconds()).slice(-3);
        var length = format.match(/S/g).length;
        for (var i = 0; i < length; i++) format = format.replace(/S/, milliSeconds.substring(i, i + 1));
    }
    return format;
  },

  /**
   * 項目の表示用文字列を取得
   * @param {any} value 項目の値
   * @param {JSON} field 項目のスキーマ
   * @returns 
   */
  getFieldText: (value, field) => {
    if (value === null || value === undefined) {
      return ""
    } else if (field.type === "choice") {
      return common.getDisplayNameFromChoice(value, field.choices);
    } else if (field.type === "choices") {
      return field.choices.filter(i => value.indexOf(i.value) >= 0).map(i => i.text).join(",")
    } else {
      return value;
    }
  },

  /**
   * 選択肢から表示する名称を取得
   * @param {Object} value 選択肢の値
   * @param {Array} choices 全ての選択肢
   */
  getDisplayNameFromChoice: (value, choices) => {
    if (!common.isEmpty(choices)) {
      const choice = choices.find(i => i.value === value);
      const text = choice ? choice.text : null;
      return text || value;
    } else {
      return value;
    }
  },

  /**
   * 渡された値は項目型に一致するように変更
   * 例：type=booleanの場合、true/falseに変換
   * type=choiceの場合、値を選択肢のvalueの型に変換
   * @param {[String, Number, Boolean, Array]} value 
   * @param {Object} field 
   * @returns 
   */
  evalFieldValue: (value, field) => {
    if (value === null || value === undefined) {
      return null;
    } else if (common.isEmpty(field)) {
      return value;
    } else if (field.type === "integer") {
      return value ? parseInt(value) : null;
    } else if (field.type === "boolean") {
      if (value === undefined || value === undefined) {
        return null;
      }
      return value === true || value === "1" || value === "true";
    } else if (field.type === "choice") {
      if (field.choices && field.choices.length > 0) {
        const values = field.choices.map(i => i.value);
        if (values.indexOf(value) >= 0) {
          return value;
        }
        const val = field.choices[field.choices.length - 1].value
        if (typeof val === "number" || typeof val === "bigint") {
          return parseInt(value);
        }
      }
    }
    return value;
  },

  /**
   * ファイルをBase64に変換する.
   */
  fileToBase64: (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  }),
  
  /**
   * 文字列をBase64に変換する.
   * @param {String} s 変換しようとする文字列
   */
  strToBase64: function(s) {
    return btoa(unescape(encodeURIComponent(s)));
  },

  /**
   * エラー箇所に移動
   */
  scrollToError: function() {
    const errElement = document.querySelector(".form-control.is-invalid");
    if (errElement) {
      // scrollIntoViewOptions does not support safari[iOS] 
      errElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  },

}

export default common;
