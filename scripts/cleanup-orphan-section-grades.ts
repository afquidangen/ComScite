import "dotenv/config"
import { connectToDatabase } from "../lib/mongodb"
import { GradeModel } from "../lib/models/grade.model"

type OrphanGrade = {
  studentId: string
  code: string
  section: string
  classId: string
  note: string
}

const ORPHAN_GRADES: OrphanGrade[] = [
  {
    studentId: "11133",
    code: "PATHFIT 3",
    section: "BSCS 2A",
    classId: "SCH-1785605843705",
    note: "Test One (BSCS 2D) orphaned PATHFIT 3 pointing to a BSCS 2A class",
  },
  {
    studentId: "11133",
    code: "GEN ED 106",
    section: "BSCS 2A",
    classId: "SCH-1783573394619",
    note: "Test One (BSCS 2D) orphaned GEN ED 106 pointing to a BSCS 2A class",
  },
  {
    studentId: "NLP-22-00732",
    code: "CS 106",
    section: "BSCS 2A",
    classId: "SCH-1783573273371",
    note: "Justin Jeorge H. Cabacungan (BSCS 3B) orphaned CS 106 pointing to a BSCS 2A class",
  },
]

async function main() {
  await connectToDatabase()

  let removedCount = 0
  for (const target of ORPHAN_GRADES) {
    const matches = await GradeModel.find({
      studentId: target.studentId,
      code: target.code,
      section: target.section,
      classId: target.classId,
    }).lean()

    if (matches.length === 0) {
      console.log(`Skipped (none found): ${target.note}`)
      continue
    }

    for (const doc of matches) {
      await GradeModel.deleteOne({ _id: doc._id })
      removedCount++
      console.log(
        `Removed: studentId=${doc.studentId}, code=${doc.code}, section=${doc.section}, classId=${doc.classId}, _id=${doc._id}`
      )
    }
  }

  console.log(`\nCleanup complete. Removed ${removedCount} orphaned grade document(s).`)
  process.exit(0)
}

main().catch((err) => {
  console.error("Cleanup failed:", err)
  process.exit(1)
})
