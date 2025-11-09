class Institution {
  constructor(data) {
    this.id = data.id || null;
    this.name = data.name;
    this.location = data.location;
    this.description = data.description || '';
    this.website = data.website || '';
    this.contactEmail = data.contactEmail;
    this.contactPhone = data.contactPhone || '';
    this.faculties = data.faculties || []; // Array of faculty objects
    this.courses = data.courses || []; // Array of course IDs
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
    return new Institution({ id: snapshot.id, ...data });
  }
}

module.exports = Institution;
