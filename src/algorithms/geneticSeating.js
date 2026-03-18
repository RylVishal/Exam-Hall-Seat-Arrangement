// =====================================================
// FILE: src/algorithms/geneticSeating.js (SIMPLIFIED & FIXED)
// =====================================================
export class GeneticSeatingAlgorithm {
  constructor(students, rooms, config = {}) {
    this.students = students;
    this.rooms = rooms.sort((a, b) => b.capacity - a.capacity);
    this.populationSize = config.populationSize || 20;
    this.generations = config.generations || 50;
    this.mutationRate = config.mutationRate || 0.15;
  }

  // 🔥 FIXED: Simple, deterministic student ordering
  generateChromosome() {
    // Shuffle students randomly
    const shuffledStudents = [...this.students].sort(() => Math.random() - 0.5);
    
    const assignments = [];
    let roomIndex = 0;
    let seatIndex = 0;

    // Assign each student to a seat
    for (let i = 0; i < shuffledStudents.length; i++) {
      if (roomIndex >= this.rooms.length) {
        console.error('⚠️ Not enough room capacity for all students');
        break;
      }

      const student = shuffledStudents[i];
      const room = this.rooms[roomIndex];
      
      const row = Math.floor(seatIndex / parseInt(room.cols)) + 1;
      const col = (seatIndex % parseInt(room.cols)) + 1;

      assignments.push({
        studentId: student.id,
        studentName: student.name,
        regNo: student.regNo,
        branch: student.branch,
        roomNo: room.roomNo,
        block: room.block,
        seatNo: seatIndex + 1,
        row,
        col
      });

      seatIndex++;

      // Move to next room when current room is full
      if (seatIndex >= parseInt(room.capacity)) {
        roomIndex++;
        seatIndex = 0;
      }
    }

    return { 
      assignments, 
      fitness: 0,
      studentOrder: shuffledStudents.map(s => s.id) // Track the order
    };
  }

  // Calculate fitness (penalize same-branch neighbors)
  calculateFitness(chromosome) {
    let fitness = 100;
    const { assignments } = chromosome;

    // Group by room for easier neighbor checking
    const roomGroups = {};
    assignments.forEach(a => {
      if (!roomGroups[a.roomNo]) roomGroups[a.roomNo] = [];
      roomGroups[a.roomNo].push(a);
    });

    // Check each room
    Object.values(roomGroups).forEach(roomAssignments => {
      roomAssignments.forEach(curr => {
        // Check right neighbor
        const right = roomAssignments.find(
          a => a.row === curr.row && a.col === curr.col + 1
        );
        if (right && right.branch === curr.branch) {
          fitness -= 5;
        }

        // Check bottom neighbor
        const bottom = roomAssignments.find(
          a => a.row === curr.row + 1 && a.col === curr.col
        );
        if (bottom && bottom.branch === curr.branch) {
          fitness -= 5;
        }
      });
    });

    return Math.max(0, fitness);
  }

  // 🔥 FIXED: Simple swap-based mutation
  mutate(chromosome) {
    if (chromosome.assignments.length < 2) return;
    
    // Pick two random positions and swap the students
    const idx1 = Math.floor(Math.random() * chromosome.assignments.length);
    let idx2 = Math.floor(Math.random() * chromosome.assignments.length);
    
    // Make sure they're different
    while (idx2 === idx1) {
      idx2 = Math.floor(Math.random() * chromosome.assignments.length);
    }

    const a1 = chromosome.assignments[idx1];
    const a2 = chromosome.assignments[idx2];

    // Swap student info (keep seat positions the same)
    const temp = {
      studentId: a1.studentId,
      studentName: a1.studentName,
      regNo: a1.regNo,
      branch: a1.branch
    };

    a1.studentId = a2.studentId;
    a1.studentName = a2.studentName;
    a1.regNo = a2.regNo;
    a1.branch = a2.branch;

    a2.studentId = temp.studentId;
    a2.studentName = temp.studentName;
    a2.regNo = temp.regNo;
    a2.branch = temp.branch;
  }

  // 🔥 SIMPLIFIED: Just generate new population, no complex crossover
  run() {
    let population = [];

    // Generate initial population
    console.log('🔄 Generating initial population...');
    for (let i = 0; i < this.populationSize; i++) {
      population.push(this.generateChromosome());
    }

    let bestEver = null;
    let bestFitness = -1;

    // Evolution
    for (let gen = 0; gen < this.generations; gen++) {
      // Calculate fitness
      population.forEach(chromo => {
        chromo.fitness = this.calculateFitness(chromo);
      });

      // Sort by fitness
      population.sort((a, b) => b.fitness - a.fitness);

      // Track best
      if (population[0].fitness > bestFitness) {
        bestFitness = population[0].fitness;
        bestEver = JSON.parse(JSON.stringify(population[0]));
      }

      // Keep top 30% as elite
      const eliteCount = Math.floor(this.populationSize * 0.3);
      const newPopulation = population.slice(0, eliteCount);

      // Fill rest with mutations of elite
      while (newPopulation.length < this.populationSize) {
        // Pick a random elite
        const parent = population[Math.floor(Math.random() * eliteCount)];
        
        // Clone it
        const offspring = JSON.parse(JSON.stringify(parent));
        
        // Mutate it (do multiple mutations for more variety)
        const numMutations = Math.floor(Math.random() * 3) + 1;
        for (let m = 0; m < numMutations; m++) {
          this.mutate(offspring);
        }
        
        newPopulation.push(offspring);
      }

      population = newPopulation;
    }

    // Final fitness calculation
    population.forEach(chromo => {
      chromo.fitness = this.calculateFitness(chromo);
    });
    population.sort((a, b) => b.fitness - a.fitness);

    const bestSolution = bestFitness > population[0].fitness ? bestEver : population[0];

    // 🔥 VALIDATION
    const studentIds = bestSolution.assignments.map(a => a.studentId);
    const uniqueIds = new Set(studentIds);

    console.log('📊 Final Solution Stats:');
    console.log('  Total students:', this.students.length);
    console.log('  Assigned students:', studentIds.length);
    console.log('  Unique students:', uniqueIds.size);
    console.log('  Fitness score:', bestSolution.fitness.toFixed(2));

    if (studentIds.length !== uniqueIds.size) {
      console.error('❌ DUPLICATES DETECTED!');
      // Find duplicates
      const counts = {};
      studentIds.forEach(id => {
        counts[id] = (counts[id] || 0) + 1;
      });
      const duplicates = Object.entries(counts).filter(([_, count]) => count > 1);
      console.error('Duplicates:', duplicates);
    }

    if (uniqueIds.size !== this.students.length) {
      console.error('❌ MISSING STUDENTS!');
      const assignedSet = new Set(studentIds);
      const missing = this.students.filter(s => !assignedSet.has(s.id));
      console.error('Missing:', missing.map(s => `${s.name} (${s.regNo})`));
    }

    if (studentIds.length === uniqueIds.size && uniqueIds.size === this.students.length) {
      console.log('✅ All validations passed!');
    }

    return bestSolution;
  }

  // Allocate invigilators
  allocateInvigilators(assignments, staff) {
    const roomsUsed = [...new Set(assignments.map(a => a.roomNo))];
    const availableStaff = staff.filter(s => s.available);
    const invigilators = [];
    const assignedStaffIds = new Set();

    roomsUsed.forEach((roomNo) => {
      const staffMember = availableStaff.find(s => !assignedStaffIds.has(s.id));
      
      if (staffMember) {
        invigilators.push({
          staffId: staffMember.id,
          staffName: staffMember.name,
          roomNo,
          duty: 'Invigilator',
          type: 'staff'
        });
        assignedStaffIds.add(staffMember.id);
      }
    });

    return {
      allocations: invigilators,
      assignedStaffIds: Array.from(assignedStaffIds)
    };
  }
}