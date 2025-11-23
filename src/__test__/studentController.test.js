import {jest, describe, it, expect, beforeEach, beforeAll, afterAll} from '@jest/globals';
import request from 'supertest';

// Service mocks scaffold
const serviceMock = {
  addStudent: jest.fn(),
  findStudent: jest.fn(),
  updateStudent: jest.fn(),
  deleteStudent: jest.fn(),
  addScore: jest.fn(),
  findByName: jest.fn(),
  countByNames: jest.fn(),
  findByMinScore: jest.fn(),
};

// IMPORTANT: mock the dependency first, then import the module under test
await jest.unstable_mockModule('../service/studentService.js', () => ({
  ...serviceMock,
}));

// Import validator schemas
const validatorMock = {
  studentSchema: { validate: jest.fn() },
  updateStudentSchema: { validate: jest.fn() },
  scoreSchema: { validate: jest.fn() }
};

await jest.unstable_mockModule('../validator/studentValidator.js', () => ({
  ...validatorMock,
}));

// Import the Express app
const app = (await import('../server.js')).default;

// Disable actual MongoDB connection
jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue({}),
  Schema: jest.fn().mockReturnValue({
    pre: jest.fn().mockReturnThis(),
    index: jest.fn().mockReturnThis()
  }),
  model: jest.fn().mockReturnValue({})
}));

// Add lifecycle hooks
beforeAll(() => {
  // Silence console logs during tests
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterAll(() => {
  // Restore console logs
  console.log.mockRestore();
});

beforeEach(() => {
  // Reset all mock functions state
  Object.values(serviceMock).forEach(fn => fn.mockReset());
  Object.values(validatorMock).forEach(schema => schema.validate.mockReset());
});

describe('POST /students - Add Student', () => {
  it('returns 400 if validation fails', async () => {
    // Setup
    validatorMock.studentSchema.validate.mockReturnValue({ error: { details: [{ message: 'Invalid data' }] } });

    // Execute & Verify
    const response = await request(app)
      .post('/students')
      .send({ id: '1', name: 'Alice' })
      .expect(400);

    expect(response.body).toEqual({ error: 'Invalid data' });
    expect(validatorMock.studentSchema.validate).toHaveBeenCalled();
    expect(serviceMock.addStudent).not.toHaveBeenCalled();
  });

  it('returns 201 if student is added successfully', async () => {
    // Setup
    validatorMock.studentSchema.validate.mockReturnValue({});
    serviceMock.addStudent.mockResolvedValue(true);

    // Execute & Verify
    await request(app)
      .post('/students')
      .send({ id: '1', name: 'Alice', password: 'secret' })
      .expect(201);

    expect(validatorMock.studentSchema.validate).toHaveBeenCalled();
    expect(serviceMock.addStudent).toHaveBeenCalledWith({ id: '1', name: 'Alice', password: 'secret' });
  });

  it('returns 409 if student already exists', async () => {
    // Setup
    validatorMock.studentSchema.validate.mockReturnValue({});
    serviceMock.addStudent.mockResolvedValue(false);

    // Execute & Verify
    await request(app)
      .post('/students')
      .send({ id: '1', name: 'Alice', password: 'secret' })
      .expect(409);

    expect(serviceMock.addStudent).toHaveBeenCalledWith({ id: '1', name: 'Alice', password: 'secret' });
  });
});

describe('GET /students/:id - Find Student', () => {
  it('returns student if found', async () => {
    // Setup
    const student = { _id: '1', name: 'Alice' };
    serviceMock.findStudent.mockResolvedValue(student);

    // Execute & Verify
    const response = await request(app)
      .get('/students/1')
      .expect(200);

    expect(response.body).toEqual(student);
    expect(serviceMock.findStudent).toHaveBeenCalledWith(1);
  });

  it('returns 404 if student not found', async () => {
    // Setup
    serviceMock.findStudent.mockResolvedValue(null);

    // Execute & Verify
    await request(app)
      .get('/students/1')
      .expect(404);

    expect(serviceMock.findStudent).toHaveBeenCalledWith(1);
  });
});

describe('PATCH /students/:id - Update Student', () => {
  it('returns 400 if validation fails', async () => {
    // Setup
    validatorMock.updateStudentSchema.validate.mockReturnValue({ error: { details: [{ message: 'Invalid data' }] } });

    // Execute & Verify
    const response = await request(app)
      .patch('/students/1')
      .send({ name: 'Alice' })
      .expect(400);

    expect(response.body).toEqual({ error: 'Invalid data' });
    expect(validatorMock.updateStudentSchema.validate).toHaveBeenCalled();
    expect(serviceMock.updateStudent).not.toHaveBeenCalled();
  });

  it('returns updated student if successful', async () => {
    // Setup
    const updatedStudent = { _id: '1', name: 'Alice Updated' };
    validatorMock.updateStudentSchema.validate.mockReturnValue({});
    serviceMock.updateStudent.mockResolvedValue(updatedStudent);

    // Execute & Verify
    const response = await request(app)
      .patch('/students/1')
      .send({ name: 'Alice Updated' })
      .expect(200);

    expect(response.body).toEqual(updatedStudent);
    expect(validatorMock.updateStudentSchema.validate).toHaveBeenCalled();
    expect(serviceMock.updateStudent).toHaveBeenCalledWith(1, { name: 'Alice Updated' });
  });

  it('returns 404 if student not found', async () => {
    // Setup
    validatorMock.updateStudentSchema.validate.mockReturnValue({});
    serviceMock.updateStudent.mockResolvedValue(null);

    // Execute & Verify
    await request(app)
      .patch('/students/1')
      .send({ name: 'Alice Updated' })
      .expect(404);

    expect(serviceMock.updateStudent).toHaveBeenCalledWith(1, { name: 'Alice Updated' });
  });
});

describe('DELETE /students/:id - Delete Student', () => {
  it('returns deleted student if successful', async () => {
    // Setup
    const deletedStudent = { _id: '1', name: 'Alice' };
    serviceMock.deleteStudent.mockResolvedValue(deletedStudent);

    // Execute & Verify
    const response = await request(app)
      .delete('/students/1')
      .expect(200);

    expect(response.body).toEqual(deletedStudent);
    expect(serviceMock.deleteStudent).toHaveBeenCalledWith(1);
  });

  it('returns 404 if student not found', async () => {
    // Setup
    serviceMock.deleteStudent.mockResolvedValue(null);

    // Execute & Verify
    await request(app)
      .delete('/students/1')
      .expect(404);

    expect(serviceMock.deleteStudent).toHaveBeenCalledWith(1);
  });
});

describe('PATCH /score/students/:id - Add Score', () => {
  it('returns 400 if validation fails', async () => {
    // Setup
    validatorMock.scoreSchema.validate.mockReturnValue({ error: { details: [{ message: 'Invalid score' }] } });

    // Execute & Verify
    const response = await request(app)
      .patch('/score/students/1')
      .send({ examName: 'math', score: 90 })
      .expect(400);

    expect(response.body).toEqual({ error: 'Invalid score' });
    expect(validatorMock.scoreSchema.validate).toHaveBeenCalled();
    expect(serviceMock.addScore).not.toHaveBeenCalled();
  });

  it('returns 204 if score added successfully', async () => {
    // Setup
    validatorMock.scoreSchema.validate.mockReturnValue({});
    serviceMock.addScore.mockResolvedValue(true);

    // Execute & Verify
    await request(app)
      .patch('/score/students/1')
      .send({ examName: 'math', score: 90 })
      .expect(204);

    expect(validatorMock.scoreSchema.validate).toHaveBeenCalled();
    expect(serviceMock.addScore).toHaveBeenCalledWith(1, 'math', 90);
  });

  it('returns 404 if student not found', async () => {
    // Setup
    validatorMock.scoreSchema.validate.mockReturnValue({});
    serviceMock.addScore.mockResolvedValue(false);

    // Execute & Verify
    await request(app)
      .patch('/score/students/1')
      .send({ examName: 'math', score: 90 })
      .expect(404);

    expect(serviceMock.addScore).toHaveBeenCalledWith(1, 'math', 90);
  });
});

describe('GET /students/name/:name - Find Students by Name', () => {
  it('returns students found by name', async () => {
    // Setup
    const students = [{ _id: '1', name: 'Alice' }, { _id: '2', name: 'Alice' }];
    serviceMock.findByName.mockResolvedValue(students);

    // Execute & Verify
    const response = await request(app)
      .get('/students/name/Alice')
      .expect(200);

    expect(response.body).toEqual(students);
    expect(serviceMock.findByName).toHaveBeenCalledWith('Alice');
  });
});

describe('GET /quantity/students - Count Students by Names', () => {
  it('returns count for single name', async () => {
    // Setup
    serviceMock.countByNames.mockResolvedValue(2);

    // Execute & Verify
    const response = await request(app)
      .get('/quantity/students?names=Alice')
      .expect(200);

    expect(response.body).toEqual(2);
    expect(serviceMock.countByNames).toHaveBeenCalledWith(['Alice']);
  });

  it('returns count for multiple names', async () => {
    // Setup
    serviceMock.countByNames.mockResolvedValue(5);

    // Execute & Verify
    const response = await request(app)
      .get('/quantity/students?names=Alice&names=Bob')
      .expect(200);

    expect(response.body).toEqual(5);
    expect(serviceMock.countByNames).toHaveBeenCalledWith(['Alice', 'Bob']);
  });
});

describe('GET /students/exam/:exam/minscore/:minScore - Find Students by Minimum Score', () => {
  it('returns students with minimum score', async () => {
    // Setup
    const students = [
      { _id: '1', name: 'Alice', scores: { math: 90 } },
      { _id: '2', name: 'Bob', scores: { math: 85 } }
    ];
    serviceMock.findByMinScore.mockResolvedValue(students);

    // Execute & Verify
    const response = await request(app)
      .get('/students/exam/math/minscore/80')
      .expect(200);

    expect(response.body).toEqual(students);
    expect(serviceMock.findByMinScore).toHaveBeenCalledWith('math', 80);
  });
});
