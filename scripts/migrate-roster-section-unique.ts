import "dotenv/config"
import { connectToDatabase } from "../lib/mongodb"
import { ClassStudentModel } from "../lib/models/class-student.model"

async function migrate() {
  await connectToDatabase()

  const collectionName = ClassStudentModel.collection.collectionName
  const coll = ClassStudentModel.collection

  const indexes = await coll.indexes()
  const hasOld = indexes.some((i: { name?: string }) => i.name === "id_1")
  const hasNew = indexes.some((i: { name?: string }) => i.name === "id_1_section_1")

  if (hasOld) {
    await coll.dropIndex("id_1")
    console.log("Dropped old unique index id_1.")
  } else {
    console.log("Old unique index id_1 not present (or already dropped).")
  }

  if (hasNew) {
    console.log("Unique compound index id_1_section_1 already exists.")
  } else {
    await coll.createIndex({ id: 1, section: 1 }, { unique: true })
    console.log("Created unique compound index id_1_section_1.")
  }

  const finalIndexes = await coll.indexes()
  console.log(
    "classstudents indexes:",
    finalIndexes
      .map((i: { name?: string; unique?: boolean }) => `${i.name}${i.unique ? " (unique)" : ""}`)
      .join(", ")
  )

  process.exit(0)
}

migrate().catch((err) => {
  console.error("Migration failed:", err)
  process.exit(1)
})
