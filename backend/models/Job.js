class Job {
  constructor(data) {
    this.id = data.id || null;
    this.companyId = data.companyId;
    this.title = data.title;
    this.description = data.description;
    this.requirements = data.requirements || []; // Array of required qualifications
    this.location = data.location;
    this.salary = data.salary || {};
    this.type = data.type; // 'full-time', 'part-time', 'contract', 'internship'
    this.experience = data.experience || ''; // Required experience level
    this.deadline = data.deadline;
    this.status = data.status || 'active'; // 'active', 'closed', 'filled'
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.applicants = data.applicants || []; // Array of student IDs who applied
  }

  toFirestore() {
    const data = { ...this };
    delete data.id;
    return data;
  }

  static fromFirestore(snapshot) {
    const data = snapshot.data();
    return new Job({ id: snapshot.id, ...data });
  }
}

module.exports = Job;
