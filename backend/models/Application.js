class Application {
  constructor(data) {
    this.id = data.id || null;
    this.studentId = data.studentId;
    this.courseId = data.courseId;
    this.institutionId = data.institutionId;
    this.status = data.status || 'pending'; // 'pending', 'approved', 'rejected', 'admitted'
    this.appliedAt = data.appliedAt || new Date();
    this.reviewedAt = data.reviewedAt || null;
    this.reviewerId = data.reviewerId || null; // Institute admin who reviewed
    this.notes = data.notes || '';
    this.documents = data.documents || []; // Array of uploaded document URLs
  }

  toFirestore() {
    const data = { ...this };
    delete data.id;
    return data;
  }

  static fromFirestore(snapshot) {
    const data = snapshot.data();
    return new Application({ id: snapshot.id, ...data });
  }
}

module.exports = Application;
