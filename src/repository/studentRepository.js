import { Student } from '../model/student.js';



const students = new Map();

export const addStudent = ({id, name, password}) => {
    if(students.has(id)) {
       return false;
    }
    students.set(+id, new Student(+id, name, password))
    return true;
}



export const findStudent = id => students.get(+id);

export const updateStudent = (id, updates) => {
    const student = students.get(+id);
    if (!student) return null;

    if (updates.name) student.name = updates.name;
    if (updates.password) student.password = updates.password;

    return student;
}

export const deleteStudent = id => students.delete(+id)

export const addScore = (id, {examName, score}) => {
    const student = students.get(+id);
    if (!student) return null;
    student.scores[examName] = score;
    return student;
}


export const findByName = (name) => {
    return [...students.values()].filter(student => student.name.toLowerCase() === name.toLowerCase());
};





export const countByNames = (name) => {
    let count = 0;
    [...students.values()].forEach(student => {
        if (student.name.toLowerCase() === name.toLowerCase()) {
            count++;
        }
    });
    return count;
};

export const findByMinScore = (examName, minScore) => {
    if (!examName || typeof examName !== 'string') return [];

    return [...students.values()].filter(student => {
        if (!student.scores || typeof student.scores !== 'object') return false;
        const scoreKey = Object.keys(student.scores)
            .find(key => typeof key === 'string' && key.toLowerCase() === examName.toLowerCase());

        const score = scoreKey ? student.scores[scoreKey] : undefined;

        return score !== undefined && score >= minScore;
    });
};




export const getAllStudents = () => [...students.values()];
