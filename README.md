## list schema props
| 項目 | 必須 | 既定値 | 型 | 備考 |
|-----|-----|-----|-----|-----|
| key | 必須 | | String | この値によってレコードから項目を値を取得 |
| type | 必須 | | String | 使用できるのは[string, integer, boolean, choice, date, text, file]の１つ |
| label | 必須 | | String | ヘッダーに表示する名称 |
| choices | | | String | type="choice"のみ有効、プルダウンのoptionsとして扱う |
| formatter | | | Function/String | データを表示メソッド<br>integerの場合は自動カンマ切り<br>choiceの場合は自動optionのtext項目を表示 |
| thClass | | | String/Array | ヘッダー部分のCSS class<br>integerの場合は自動右揃え(text-right) |
| tdClass | | | String/Array | ボディ部分のCSS class<br>integerの場合は自動右揃え(text-right) |
| tdAttr | | | Object/Function | ボディ部分のCSS<br>textの場合は自動「{ "style": "white-space: pre-line;" }」を追加 |
| sortable | | false | Boolean | 並び替えできるかどうか |
| searchable | | false | Boolean | フィルターとして検索できるのか |
| variant | | | String | searchable="true"のみ有効<br>type="boolean", variant="select"の場合、フィルターはCheckboxではなくプルダウンとして表示 |
| visible | | true | Boolean | 一覧に表示するかどうか |
| csv | | true | Boolean | CSVダウンロード時CSVファイルに出力するかどうか |
| rowVariant | | | Function | (value, rowData) => {}<br>value: 当該項目の値<br>rowData: 行全体の値(json)<br>戻り値: [primary, secondary, success, warning, danger, info, light, dark] の１つ、詳しくは[Bootstrap-VueのBase variants](https://bootstrap-vue.org/docs/reference/color-variants#color-variants-and-css-class-mapping)をご参照ください。 |

その他の属性は[bootstrap-vue](https://bootstrap-vue.org/docs/components/table#field-definition-reference)をご参照ください。

## form schema props
| 項目 | 必須 | 既定値 | 型 | 備考 |
|-----|-----|-----|-----|-----|
| key | 必須 | | String | この値によってレコードから項目を値を取得 |
| type | 必須 | | String | 使用できるのは[string, integer, boolean, choice, date, text, file]の１つ |
| label | 必須 | | String | ヘッダーに表示する名称 |
| choices | | | String | type="choice"のみ有効、プルダウンのoptionsとして扱う |
| readonly | | false | Boolean | 読み取り専用 |
| required | | false | Boolean | 必須であるかどうか |
| visible | | true | Boolean | フォームに表示するかどうか |
| maxlength | | | Number | 文字数、[string, text]の場合有効 |
| default | | | Any | 値が設定されていない場合(undefined)を既定値 |
| helptext | | | String | 説明文字 |
| limit | | | Number | type="file"のみ有効、ファイルのサイズチェック |
| step | | | | typeは["file", "decimal"]のみ有効 |
| minvalue | | | | typeは["file", "decimal"]のみ有効<br>vee-validateにも使用される |
| maxvalue | | | | typeは["file", "decimal"]のみ有効<br>vee-validateにも使用される |
| date_gte | | | String | 日付のチェックルール<br>「@key」keyの部分はSchemaの別項目のキー<br>詳しくは[vee-validate Cross Field Validation](https://vee-validate.logaretm.com/v3/advanced/cross-field-validation.html)をご参照ください。 |
