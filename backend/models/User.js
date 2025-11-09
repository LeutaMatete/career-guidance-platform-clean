class User {
  constructor(data) {
    this.id = data.id || null;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role; // 'admin', 'institute', 'student', 'company'
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.phone = data.phone || '';
    this.isVerified = data.isVerified || false;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();

    // Role-specific fields
    if (this.role === 'student') {
      this.grade = data.grade || '';
      this.qualifications = data.qualifications || [];
      this.transcripts = data.transcripts || [];
    } else if (this.role === 'institute') {
      this.institutionName = data.institutionName;
      this.location = data.location;
      this.description = data.description || '';
    } else if (this.role === 'company') {
      this.companyName = data.companyName;
      this.industry = data.industry;
      this.location = data.location;
      this.description = data.description || '';
    }
  }

  toFirestore() {
    const data = { ...this };
    delete data.id;
    return data;
  }

  static fromFirestore(snapshot) {
    const data = snapshot.data();
    return new User({ id: snapshot.id, ...data });
  }
}

module.exports = User;
