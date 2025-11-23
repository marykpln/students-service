import {Router} from "express";
import {
    addScore,
    addStudent, countByNames,
    deleteStudent, findByMinScore,
    findByName,
    findStudent,
    updateStudent
} from "../controller/studentController.js";

const router = Router();

router.post("/students", addStudent);
router.get('/students/:id', findStudent);
router.delete('/students/:id', deleteStudent);
router.patch('/students/:id', updateStudent);
router.patch('/score/students/:id', addScore);
router.get('/students/name/:name', findByName);
router.get('/quantity/students', countByNames);
router.get('/students/exam/:exam/minscore/:minScore', findByMinScore);

export default router;
