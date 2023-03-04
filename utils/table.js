import common from "./common";
import constants from './constants';

const table = {
  /**
   * テーブルに表示項目を再設定する
   * @param {Array} schema 
   */
  setSchemaFormatter: (schema) => {
    schema.map(field => {
      if (field.formatter === undefined) {
        if(["integer", "decimal"].indexOf(field.type) >= 0) {
          // 整数の場合はカンマ切り
          field.formatter = (value) => {
            return common.toNumComma(value);
          }
          field.thClass = "text-right";  // 右揃え表示
          field.tdClass = "text-right";  // 右揃え表示
        } else if (field.type === "boolean") {
          field.thClass = "text-center";  // 中央揃え表示
          field.tdClass = "text-center";  // 中央揃え表示
        } else if (field.type === "choice") {
          // 選択肢がある場合はvalueではなく、textを表示
          field.formatter = (value) => {
            const option = field.choices.find(i => i.value === value);
            return option ? option.text : value;
          }
        } else if (field.type === "text") {
          // Textの場合は改行表示(bootstrapのclassが見つかってない)
          field.tdAttr = { "style": "white-space: pre-line;" }
        }
      }
    });
  },
  getLocalStorageFilter: (storageKey) => {
    let _filter = localStorage.getItem(constants.KEY_DATATABLE_FILTER);
    if (_filter) {
      _filter = JSON.parse(_filter);
    }
    if (storageKey) {
      return (_filter && _filter[storageKey]) ? _filter[storageKey] : {}
    } else {
      return {}
    }
  },
  saveLocalStorageFilter: (storageKey, filter) => {
    if (storageKey) {
      const _filter = table.getLocalStorageFilter(true);
      _filter[storageKey] = filter
      localStorage.setItem(constants.KEY_DATATABLE_FILTER, JSON.stringify(_filter));
    }
  },

  /**
   * JSONの配列にデータを検索する
   * @param {Array} array 
   * @param {JSON} filters 
   */
  stableFilter: function(array, filters) {
    Object.keys(filters).map(key => {
      array = array.filter(function(item) {
        let item_value = item[key];
        if (filters[key] && Array.isArray(filters[key].children)) {
          // 組織などの階層化に対しての検索、すべての子項目を含めて検索
          return filters[key].value === item_value || filters[key].children.indexOf(item_value) >= 0;
        } else if (item_value === true || item_value === false) {
          return (filters[key] === true || filters[key] === false) ? item_value === filters[key] : true;
        } else if (filters[key] === true || filters[key] === false) {
          return item_value === (filters[key] === true ? 1 : 0);
        } else if (typeof item_value === 'number') {
          return item_value === filters[key];
        } else if (item_value) {
          return item_value.indexOf(filters[key]) >= 0;
        } else {
          return false;
        }
      })
      return array;
    });
    return array;
  },

  downloadDataTableCSV: function(filename, tableHead, tableData) {
    const data = common.dataTableToCSV(tableHead, tableData);
    common.downloadCSV(data, filename);
  },

  /**
   * DataTableのデータをＣＳＶに変換する
   * @param {Array} tableHead テーブルのヘッダー
   * @param {Array} tableData テーブルのデータ
   */
  dataTableToCSV: function(tableHead, tableData) {
    let headArray = [];
    let csvArray = [];
    tableHead = tableHead.filter(col => (col.visible !== false || col.csv === true));
    tableHead = tableHead.filter(col => (col.csv !== false));
    tableHead.map(col => (
      headArray.push(col.label || col.key)
    ));
    csvArray.push(headArray);
    // データ部分をＣＳＶに入れる
    tableData.forEach(function(row) {
      let dataArray = [];
      tableHead.map(col => {
        dataArray.push(common.getFieldText(row[col.key], col));
        return true;
      });
      csvArray.push(dataArray);
    });

    return common.arrayToCSV(csvArray);
  },

  arrayToCSV: function(array) {
    let lineArray = [];
    array.forEach(function (infoArray, index) {  // eslint-disable-line
      let line = infoArray.join('","');
      lineArray.push(`"${line}"`);
    });
    let csvContent = lineArray.join("\n");
    return csvContent;
  },

  downloadCSV: function (csvContent, filename) {
    filename = `${filename || "export"}_${common.formatDate(new Date(), "YYYYMMDD_hhmmss")}.csv`;
    let link = document.createElement('a');
    let bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    let blob = new Blob([bom, csvContent], { type: 'text/csv' });
    link.setAttribute('download', filename);
    if (window.webkitURL && window.webkitURL.createObjectURL) {
      // for chrome (and safari)
      link.setAttribute('href', window.webkitURL.createObjectURL(blob));
      link.click();
    } else if (window.URL && window.URL.createObjectURL) {
      // for firefox
      link.setAttribute('href', window.URL.createObjectURL(blob));
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('サポートしないブラウザです。')
    }
  },

  getColspanArray: function(schema, isSingleLine, allowDelete) {
    const maxCount = allowDelete ? 11 : 12;
    const arr = new Array(schema.length);
    if (isSingleLine === true) {
      const avgSpan = Math.floor(maxCount / schema.length);
      if (avgSpan > 0) {
        schema.map((c, index) => (arr[index] = avgSpan));
        arr[schema.length - 1] = maxCount - ((schema.length - 1) * avgSpan);
      }
    } else {
      schema.map((c, index) => (arr[index] = maxCount));
    }
    return arr;
  },

}

export default table;
