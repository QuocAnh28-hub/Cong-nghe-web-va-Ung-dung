using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data.SqlClient;

namespace DAL
{
    public class DatabaseHelper
    {
        private readonly string _connectionString;

        public DatabaseHelper(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        // Hàm mở kết nối
        public SqlConnection GetConnection()
        {
            return new SqlConnection(_connectionString);
        }

        // Hàm thực thi SELECT trả DataTable (nếu bạn muốn dùng DataTable)
        public DataTable ExecuteQuery(string sql, SqlParameter[]? parameters = null)
        {
            using (var conn = GetConnection())
            {
                using (var cmd = new SqlCommand(sql, conn))
                {
                    if (parameters != null)
                        cmd.Parameters.AddRange(parameters);

                    using (var adapter = new SqlDataAdapter(cmd))
                    {
                        DataTable dt = new DataTable();
                        adapter.Fill(dt);
                        return dt;
                    }
                }
            }
        }

        // Hàm thực thi INSERT / UPDATE / DELETE
        public int ExecuteNonQuery(string sql, SqlParameter[]? parameters = null)
        {
            using (var conn = GetConnection())
            {
                conn.Open();
                using (var cmd = new SqlCommand(sql, conn))
                {
                    if (parameters != null)
                        cmd.Parameters.AddRange(parameters);

                    return cmd.ExecuteNonQuery();
                }
            }
        }
    }
}
