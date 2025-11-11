import * as repo from '../repository/studentRepository.js';

export const addStudent = (req, res) => {
    const success = repo.addStudent(req.body);
    if(success) {
        res.status(204).send();
    }else {
        res.status(409).send();
    }
}

export const findStudent = (req, res) => {
   const student = repo.findStudent(+req.params.id);
   if(student) {
       const {password, ...studentWithoutPassword} = student;
       res.json(studentWithoutPassword);
   }else {
       res.status(404).send();
   }
}

export const updateStudent = (req, res) => {
    const studentId = +req.params.id;
    const { name, password } = req.body;

    if (!name && !password) {
        res.status(400).json({ message: 'name or password' });
        return;
    }
    console.log('All students:',repo.getAllStudents());

    const updatedStudent = repo.updateStudent(+studentId, { name, password });
    console.log(updatedStudent)

    if (updatedStudent) {
        const { password, ...studentWithoutPassword } = updatedStudent;
        res.json(studentWithoutPassword);
    } else {
        res.status(404).json({ message: 'not found' });
    }
};


export const deleteStudent = (req, res) => {
const deleted = repo.deleteStudent(+req.params.id);
if(deleted) {
    res.status(204).send();
}else {
    res.status(404).send();
}
}

export const addScore = (req, res) => {
    const student = repo.addScore(+req.params.id, req.body);
    if(student) {
        res.status(204).send();
    }else {
        res.status(404).send();
    }
}

export const findByName = (req, res) => {
    const students = repo.findByName(req.params.name);
    console.log(students);

    if (students.length > 0) {
        res.json(students); // отправляем результат клиенту
    } else {
        res.status(404).send({ error: "Students not found" });
    }
};




export const countByNames = (req, res) => {
    const { names } = req.query;

    if (!names) {
        return res.status(400).json({ error: "Missing 'names' query parameter" });
    }

    const namesArray = Array.isArray(names) ? names : [names];


    const totalCount = namesArray.reduce((sum, name) => {
        return sum + repo.countByNames(name);
    }, 0);

    if (totalCount > 0) {
        res.json(totalCount);
    } else {
        res.status(404).json({ error: "Students not found" });
    }
};



export const  findByMinScore = (req, res) => {
    const { examName, minScore } = req.params;
        console.log(examName, minScore); // History 90
    const minScoreNum = +minScore;

    const filteredStudents = repo.findByMinScore(examName, minScoreNum);

    if (filteredStudents.length > 0) {
        res.json(filteredStudents); // отправляем результат клиенту
    } else {
        res.status(404).json({ error: "Students not found" });
    }
};



