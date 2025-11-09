class Course {
  constructor(data) {
    this.id = data.id || null;
    this.institutionId = data.institutionId;
    this.facultyId = data.facultyId;
    this.name = data.name;
    this.code = data.code;
    this.description = data.description || '';
    this.duration = data.duration; // in years
    this.level = data.level; // 'certificate', 'diploma', 'degree', 'masters', 'phd'
    this.requirements = data.requirements || []; // Array of qualification requirements
    this.fees = data.fees || {};
    this.capacity = data.capacity || 0;
    this.availableSlots = data.availableSlots || this.capacity;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.status = data.status || 'active'; // 'active', 'inactive'
  }

  toFirestore() {
    const data = { ...this };
    delete data.id;
    return data;
  }

  static fromFirestore(snapshot) {
    const data = snapshot.data();
    return new Course({ id: snapshot.id, ...data });
  }
}

module.exports = Course;
