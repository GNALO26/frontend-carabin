import React from 'react';

const DataTable = ({ 
  columns, 
  data, 
  onEdit, 
  onDelete,
  onRowClick
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            {columns.map((column) => (
              <th 
                key={column.key} 
                className="py-3 px-4 text-left bg-gray-100 font-medium"
              >
                {column.header}
              </th>
            ))}
            <th className="py-3 px-4 bg-gray-100"></th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr 
              key={item.id || index} 
              className={`border-b hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick && onRowClick(item)}
            >
              {columns.map((column) => (
                <td key={`${item.id || index}-${column.key}`} className="py-3 px-4">
                  {column.render ? column.render(item) : item[column.key]}
                </td>
              ))}
              <td className="py-3 px-4 flex space-x-2 justify-end">
                {onEdit && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(item);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Éditer
                  </button>
                )}
                {onDelete && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    Supprimer
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
