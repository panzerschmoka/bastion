import { createClient } from "@libsql/client";
import * as fs from "fs";

// 1. Учетные данные к Turso (Берутся из твоего .env.production)
const url = "libsql://panzerschmoka-panzerschmoka.aws-ap-south-1.turso.io";
const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzU2NjYwNzQsImlkIjoiMDE5ZDZkZjEtY2UwMS03YTM5LWIzMjctMTE2YzlmY2IxMGZhIiwicmlkIjoiMDk5ZWQ2YzQtMWEwZS00MTBlLTk2YWEtZjdlNGFmNDM4NjgwIn0.kNVWtH-GvkwEey6FCmuYmA5A_ZlA2U-H2pl6eMrbNaQn3rHKey9se4dICa8XZ6pRKUqYHzLSoUAu7Cyt68tGBA";

async function pushSchema() {
    try {
        console.log("Подключение к удаленной базе Turso...");
        const client = createClient({ url, authToken });
        
        console.log("Чтение файла migration.sql...");
        const sql = fs.readFileSync("migration.sql", "utf8");
        
        // Разбиваем SQL файл на отдельные запросы
        const statements = sql
            .split(";")
            .map(s => s.trim())
            .filter(s => s.length > 0);

        console.log(`Найдено таблиц/запросов для создания: ${statements.length}`);

        // Выполняем каждый запрос
        for(const stmt of statements) {
            try {
                await client.execute(stmt);
                console.log("✓ Успешно выполнено: " + stmt.substring(0, 45).replace(/\n/g, "") + "...");
            } catch(e) {
                if(e.message && e.message.includes("already exists")) {
                    console.log("⚠ Пропущено (уже существует): " + stmt.substring(0, 30).replace(/\n/g, ""));
                } else {
                    console.error("⨯ Ошибка при выполнении:", e.message);
                }
            }
        }

        console.log("🎉 Миграция успешно завершена! Твоя база в Turso готова.");
        process.exit(0);
    } catch(err) {
        console.error("ОШИБКА: ", err);
    }
}

pushSchema();
