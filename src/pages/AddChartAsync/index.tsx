import {genChartByAiAsyncUsingPOST} from '@/services/lingxibi/chartController';
import {UploadOutlined, EditOutlined} from '@ant-design/icons';
import {Alert, Button, Card, Form, Input, message, Select, Space, Upload, Table, Modal, Checkbox, Flex} from 'antd';
import {useForm} from 'antd/es/form/Form';
import TextArea from 'antd/es/input/TextArea';
import React, {useState} from 'react';
import * as XLSX from 'xlsx';

/**
 * 添加图表（异步）页面
 * @constructor
 */
const AddChartAsync: React.FC = () => {
  const [form] = useForm();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [excelData, setExcelData] = useState<any[]>([]);
  const [excelColumns, setExcelColumns] = useState<any[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<{ [key: string]: boolean }>({});
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [fileData, setFileData] = useState<any>(null);
  const [selectionMode, setSelectionMode] = useState<'row' | 'column' | 'cell'>('row');

  // 处理文件上传
  const handleFileUpload = (info: any) => {
    const {file} = info;
    const reader = new FileReader();

    // 确保我们有有效的文件对象
    const fileObj = file.originFileObj ? file.originFileObj : file;

    // 检查是否是有效的文件对象
    if (!(fileObj instanceof Blob)) {
      message.error('无效的文件对象');
      return;
    }

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, {type: 'array'});

        // 获取第一个工作表
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // 转换为 JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1});

        if (jsonData.length > 0) {
          // 第一行作为表头
          const headers = jsonData[0].map((header, index) => ({
            title: header || `列 ${index + 1}`,
            dataIndex: `col_${index}`,
            key: `col_${index}`,
          }));

          // 其余行作为数据
          const tableData = jsonData.slice(1).map((row, rowIndex) => {
            const obj = {key: rowIndex};
            row.forEach((cell, cellIndex) => {
              obj[`col_${cellIndex}`] = cell;
            });
            return obj;
          });

          setExcelColumns(headers);
          setExcelData(tableData);
          setSelectedColumns(headers.map(col => col.dataIndex));
          setSelectedRowKeys(tableData.map(item => item.key));
          setSelectedCells({});
          setFileData(fileObj);

          // 显示编辑弹窗
          setShowEditor(true);
        }
      } catch (error) {
        message.error('文件解析失败，请检查文件格式');
      }
    };

    // 使用有效的文件对象
    reader.readAsArrayBuffer(fileObj);
  };

  // 处理列选择变化
  const handleColumnSelect = (checkedValues: string[]) => {
    setSelectedColumns(checkedValues);
  };

  // 处理行选择变化
  const handleRowSelect = (selectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(selectedRowKeys);
  };

  // 处理单元格选择变化
  const handleCellSelect = (rowKey: React.Key, columnKey: string) => {
    const cellKey = `${rowKey}_${columnKey}`;
    setSelectedCells(prev => ({
      ...prev,
      [cellKey]: !prev[cellKey]
    }));
  };

  // 准备要导出的数据
  const prepareExportData = () => {
    if (selectionMode === 'cell') {
      // 单元格选择模式
      const exportData: any[] = [];
      const usedRows = new Set<React.Key>();
      const usedColumns = new Set<string>();

      // 收集所有选中的单元格
      excelData.forEach(row => {
        if (selectedCells[`${row.key}_all`]) {
          // 整行选中
          const newRow: any = {key: row.key};
          excelColumns.forEach(col => {
            if (selectedColumns.includes(col.dataIndex)) {
              newRow[col.dataIndex] = row[col.dataIndex];
              usedColumns.add(col.dataIndex);
            }
          });
          exportData.push(newRow);
          usedRows.add(row.key);
        } else {
          const newRow: any = {key: row.key};
          let hasCell = false;
          excelColumns.forEach(col => {
            if (selectedCells[`${row.key}_${col.dataIndex}`]) {
              newRow[col.dataIndex] = row[col.dataIndex];
              usedColumns.add(col.dataIndex);
              hasCell = true;
            }
          });
          if (hasCell) {
            exportData.push(newRow);
            usedRows.add(row.key);
          }
        }
      });

      // 准备表头
      const exportColumns = excelColumns.filter(col => Array.from(usedColumns).includes(col.dataIndex));

      return {data: exportData, columns: exportColumns};
    } else if (selectionMode === 'row') {
      // 行选择模式
      const rowsToExport = selectedRowKeys.length > 0
        ? excelData.filter(item => selectedRowKeys.includes(item.key))
        : excelData;

      const colsToExport = selectedColumns.length > 0
        ? selectedColumns
        : excelColumns.map(col => col.dataIndex);

      // 准备数据
      const exportData = rowsToExport.map(row => {
        const newRow: any = {};
        colsToExport.forEach(col => {
          newRow[col] = row[col];
        });
        return newRow;
      });

      // 准备表头
      const exportColumns = excelColumns.filter(col => colsToExport.includes(col.dataIndex));

      return {data: exportData, columns: exportColumns};
    } else {
      // 列选择模式
      const colsToExport = selectedColumns.length > 0
        ? selectedColumns
        : excelColumns.map(col => col.dataIndex);

      // 准备数据
      const exportData = excelData.map(row => {
        const newRow: any = {};
        colsToExport.forEach(col => {
          newRow[col] = row[col];
        });
        return newRow;
      });

      // 准备表头
      const exportColumns = excelColumns.filter(col => colsToExport.includes(col.dataIndex));

      return {data: exportData, columns: exportColumns};
    }
  };

  // 提交数据到后端
  const onFinish = async (values: any) => {
    if (submitting) {
      return;
    }

    setSubmitting(true);

    try {
      // 准备要提交的数据
      const {data: exportData, columns: exportColumns} = prepareExportData();

      // 将数据转换回 Excel 格式
      const headers = exportColumns.map(col => col.title);
      const excelRows = [headers, ...exportData.map(row => {
        return exportColumns.map(col => row[col.dataIndex]);
      })];

      const ws = XLSX.utils.aoa_to_sheet(excelRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

      // 将工作簿转换为二进制数据，明确指定为 xlsx 格式
      const excelBuffer = XLSX.write(wb, {
        bookType: 'xlsx', // 明确指定为 xlsx 格式
        type: 'array'
      });

      // 创建 Blob 对象时指定正确的 MIME 类型
      const excelFile = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      // 创建一个 File 对象并指定正确的文件名和后缀
      const fileName = `analysis_data_${Date.now()}.xlsx`;
      const fileToUpload = new File([excelFile], fileName, {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      // 准备提交参数
      const params = {
        ...values,
        file: undefined,
      };

      // 调用后端接口，传递正确的文件对象
      const res = await genChartByAiAsyncUsingPOST(params, {}, fileToUpload);

      if (!res?.data) {
        message.error('分析失败,' + res.message);
      } else {
        message.success('分析任务提交成功，稍后请在我的图表页面查看');
        form.resetFields();
        setShowEditor(false);
        setExcelData([]);
        setExcelColumns([]);
      }
    } catch (e: any) {
      message.error('分析失败，' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 直接提交原始文件
  const submitOriginalFile = async (values: any) => {
    if (submitting) {
      return;
    }

    setSubmitting(true);

    try {
      const params = {
        ...values,
        file: undefined,
      };

      // 确保使用正确的文件对象
      const fileObj = fileData?.originFileObj || fileData;
      if (!fileObj) {
        message.error('未找到有效的文件对象');
        return;
      }

      const res = await genChartByAiAsyncUsingPOST(params, {}, fileObj);

      if (!res?.data) {
        message.error('分析失败,' + res.message);
      } else {
        message.success('分析任务提交成功，稍后请在我的图表页面查看');
        form.resetFields();
        setShowEditor(false);
        setExcelData([]);
        setExcelColumns([]);
      }
    } catch (e: any) {
      message.error('分析失败，' + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 渲染单元格内容
  const renderCell = (text: any, record: any, column: any) => {
    const cellKey = `${record.key}_${column.dataIndex}`;
    const isSelected = selectedCells[cellKey] || selectedCells[`${record.key}_all`];

    return (
      <div
        style={{
          backgroundColor: isSelected ? '#e6f7ff' : 'transparent',
          cursor: 'pointer',
          padding: '8px',
        }}
        onClick={() => handleCellSelect(record.key, column.dataIndex)}
      >
        {text}
      </div>
    );
  };

  return (
    <div className="add-chart-async">
      <Alert
        message={'请保证输入的分析目标贴合原始数据集，否则会导致生成失败。'}
        type="info"
        showIcon
        style={{
          margin: 12,
          marginBottom: 5,
        }}
      />
      <Card title="智能分析">
        <Form
          form={form}
          name="addChart"
          labelAlign="left"
          labelCol={{span: 4}}
          wrapperCol={{span: 16}}
          onFinish={onFinish}
          initialValues={{}}
        >
          <Form.Item
            name="goal"
            label="分析目标"
            rules={[{required: true, message: '请输入分析目标'}]}
          >
            <TextArea placeholder="请输入你的分析需求，比如：分析网站用户的增长情况"/>
          </Form.Item>
          <Form.Item name="name" label="图表名称">
            <Input placeholder="请输入图表名称"/>
          </Form.Item>
          <Form.Item name="chartType" label="图表类型">
            <Select
              options={[
                {value: '折线图', label: '折线图'},
                {value: '柱状图', label: '柱状图'},
                {value: '堆叠图', label: '堆叠图'},
                {value: '饼图', label: '饼图'},
                {value: '雷达图', label: '雷达图'},
                {value: '玫瑰图', label: '玫瑰图'},
              ]}
            />
          </Form.Item>

          <Form.Item
            name="file"
            label="原始数据"
            rules={[{required: true, message: '请上传数据文件'}]}
          >
            <Upload
              name="file"
              maxCount={1}
              beforeUpload={() => false}
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
            >
              <Button icon={<UploadOutlined/>}>上传 Excel/CSV 文件</Button>
            </Upload>
          </Form.Item>

          <Form.Item wrapperCol={{span: 16, offset: 4}}>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                disabled={submitting || !fileData}
              >
                提交
              </Button>
              <Button htmlType="reset">重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* Excel 编辑弹窗 */}
      <Modal
        title={
          <div style={{textAlign: 'center', fontSize: '20px', fontWeight: 'bold', color: '#1890ff'}}>
            数据编辑与选择
          </div>
        }
        width="90%"
        open={showEditor}
        onCancel={() => setShowEditor(false)}
        footer={[
          <Flex justify="flex-end">
            <Button
              key="cancel"
              onClick={() => setShowEditor(false)}
              style={{
                background: 'linear-gradient(135deg, #ff4d4f, #f5222d)',
                color: 'white',
                border: 'none',
                boxShadow: '0 2px 8px rgba(255, 77, 79, 0.2)'
              }}
            >
              取消
            </Button>
            <Button
              key="original"
              onClick={() => {
                form.submit();
                submitOriginalFile(form.getFieldsValue());
              }}
              loading={submitting}
              style={{
                background: 'linear-gradient(135deg, #13c2c2, #08979c)',
                color: 'white',
                border: 'none',
                boxShadow: '0 2px 8px rgba(19, 194, 194, 0.2)',
                marginLeft: '5px'
              }}
            >
              直接使用原始文件
            </Button>
            <Button
              key="submit"
              type="primary"
              onClick={() => form.submit()}
              loading={submitting}
              style={{
                background: 'linear-gradient(135deg, #52c41a, #389e0d)',
                border: 'none',
                boxShadow: '0 2px 8px rgba(82, 196, 26, 0.2)',
                marginLeft: '5px'
              }}
            >
              提交选中数据
            </Button>
          </Flex>
        ]}
        bodyStyle={{
          background: '#f0f2f5',
          borderRadius: '8px',
          padding: '16px'
        }}
      >
        <div style={{
          marginBottom: '24px',
          padding: '16px',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)'
        }}>
          <Flex justify="space-between" align="center">
            <Button
              icon={<EditOutlined/>}
              type="primary"
              onClick={() => {
                const allColumnKeys = excelColumns.map(col => col.dataIndex);
                setSelectedColumns(allColumnKeys);
                setSelectedRowKeys(excelData.map(item => item.key));
                const allCells: { [key: string]: boolean } = {};
                excelData.forEach(row => {
                  excelColumns.forEach(col => {
                    allCells[`${row.key}_${col.dataIndex}`] = true;
                  });
                });
                setSelectedCells(allCells);
              }}
            >
              全选所有数据
            </Button>

            <Select
              value={selectionMode}
              onChange={setSelectionMode}
              style={{width: '160px'}}
              dropdownStyle={{
                borderRadius: '8px',
                boxShadow: '0 3px 6px rgba(0, 0, 0, 0.16)'
              }}
            >
              <Select.Option value="row">
                行选择模式
              </Select.Option>
              <Select.Option value="column">
                列选择模式
              </Select.Option>
              <Select.Option value="cell">
                单元格选择模式
              </Select.Option>
            </Select>
          </Flex>
        </div>

        {selectionMode === 'column' && (
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)'
          }}>
            <h4 style={{
              color: '#595959',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center'
            }}>
              选择要包含的列:
            </h4>
            <Checkbox.Group
              options={excelColumns.map(col => ({
                label: (
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: selectedColumns.includes(col.dataIndex) ? '#e6f7ff' : 'transparent',
                    border: selectedColumns.includes(col.dataIndex) ? '1px solid #1890ff' : '1px solid #d9d9d9'
                  }}>
              {col.title}
            </span>
                ),
                value: col.dataIndex,
              }))}
              value={selectedColumns}
              onChange={handleColumnSelect}
              style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}
            />
          </div>
        )}

        {selectionMode === 'row' && (
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)'
          }}>
            <h4 style={{
              color: '#595959',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center'
            }}>
              已选择 <span style={{color: '#1890ff', margin: '0 4px'}}>{selectedRowKeys.length}</span> 行数据
            </h4>
            <Space>
              <Button
                type="primary"
                onClick={() => setSelectedRowKeys(excelData.map(item => item.key))}
              >
                全选所有行
              </Button>
              <Button
                onClick={() => setSelectedRowKeys([])}
                style={{backgroundColor: '#FD8553', color: 'white'}}
              >
                清除选择
              </Button>
            </Space>
          </div>
        )}

        {selectionMode === 'cell' && (
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)'
          }}>
            <h4 style={{
              color: '#595959',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center'
            }}>
              已选择 <span style={{color: '#1890ff', margin: '0 4px'}}>{
              Object.keys(selectedCells).filter(k => selectedCells[k]).length
            }</span> 个单元格
            </h4>
            <div style={{
              background: '#fff7e6',
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '12px',
              borderLeft: '4px solid #fa8c16'
            }}>
              提示：点击单元格进行选择，按住Shift键可多选
            </div>
            <Space>
              <Button
                onClick={() => {
                  const allCells: { [key: string]: boolean } = {};
                  excelData.forEach(row => {
                    excelColumns.forEach(col => {
                      allCells[`${row.key}_${col.dataIndex}`] = true;
                    });
                  });
                  setSelectedCells(allCells);
                }}
              >
                全选所有单元格
              </Button>
              <Button
                onClick={() => setSelectedCells({})}
              >
                清除选择
              </Button>
            </Space>
          </div>
        )}

        <div style={{
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
          overflow: 'hidden'
        }}>
          <Table
            rowSelection={selectionMode === 'row' ? {
              type: 'checkbox',
              selectedRowKeys: selectedRowKeys,
              onChange: handleRowSelect,
              columnTitle: (
                <span style={{color: '#1890ff'}}>
            选择
          </span>
              )
            } : undefined}
            columns={excelColumns.map(col => ({
              ...col,
              render: selectionMode === 'cell' ? (text: any, record: any) => renderCell(text, record, col) : undefined,
              title: (
                <span style={{fontWeight: 'bold', color: '#595959'}}>
            {col.title}
          </span>
              )
            }))}
            dataSource={excelData}
            bordered
            scroll={{x: 'max-content', y: 400}}
            pagination={false}
            style={{
              border: '1px solid #f0f0f0'
            }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default AddChartAsync;
