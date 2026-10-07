import java.sql.*;
public class DbTest {
    public static void main(String[] args) throws Exception {
        Connection c = DriverManager.getConnection("jdbc:postgresql://ep-restless-river-a1lsqg2x-pooler.ap-southeast-1.aws.neon.tech/Hospital?sslmode=require", "neondb_owner", "npg_Lt7wQz6vaYJy");
        Statement s = c.createStatement();
        ResultSet rs = s.executeQuery("SELECT count(*) FROM parameter");
        rs.next();
        System.out.println("Parameters: " + rs.getInt(1));
        
        rs = s.executeQuery("SELECT count(*) FROM items");
        rs.next();
        System.out.println("Items: " + rs.getInt(1));
        
        rs = s.executeQuery("SELECT * FROM parameter LIMIT 5");
        while(rs.next()) {
             System.out.println("Param: " + rs.getString("parameter_name") + ", " + rs.getString("parameter_value"));
        }
        c.close();
    }
}
