using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL
{
    public class DataBase_Connect
    {
        private readonly string strCon;


        public DataBase_Connect(IConfiguration configuration)
        {
            strCon = configuration.GetConnectionString("DefaultConnection");
        }


        SqlDataAdapter sqlAdap;
        DataTable dt;
        SqlCommand cmd;

        public DataTable GetDataTableFromSP(string spName, params SqlParameter[] parameters)
        {
            using (SqlConnection conn = new SqlConnection(strCon))
            {
                cmd = new SqlCommand(spName, conn);
                cmd.CommandType = CommandType.StoredProcedure;

                // Nếu có tham số thì thêm vào
                if (parameters != null)
                    cmd.Parameters.AddRange(parameters);

                sqlAdap = new SqlDataAdapter(cmd);
                dt = new DataTable();
                sqlAdap.Fill(dt);
                return dt;
            }
        }
    }
}
