import {Component, ViewChild, OnInit} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource, MatDialog} from '@angular/material';

import {WorkoutFormDialog} from '../../dialogs/workout-form/workout-form.component';
import {ConfirmDialog} from '../../dialogs/confirm/confirm.component';

import {Workout} from '../../models/workout';

import {WorkoutService} from '../../services/workout.service';

@Component({
    selector: 'app-workouts',
    templateUrl: './workouts.component.html',
    styleUrls: ['./workouts.component.css']
})
export class WorkoutsComponent implements OnInit {
    displayedColumns = ['sport', 'description', 'date', 'end_date', 'location_name', 'actions'];
    dataSource: MatTableDataSource<Workout>;

    workouts: Workout[];

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    constructor(
        private workoutService: WorkoutService,
        public dialog: MatDialog
    ) {
        this.dataSource = new MatTableDataSource(this.workouts);
    }

    ngOnInit() {
        this.workoutService.getWorkouts()
            .then((workouts: Workout[]) => {
                this.workouts = workouts;
                this.refreshTable();
            }).catch(() => {
                //this.snackBar.open('Invalid credentials !', 'OK', {duration: 5000});
                //this.snackBar.open('Internal error', 'OK', {duration: 5000});
            });
    }

    /**
     * Set the paginator and sort after the view init since this component will
     * be able to query its view for the initialized paginator and sort.
     */
    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    applyFilter(filterValue: string) {
        filterValue = filterValue.trim(); // Remove whitespace
        filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
        this.dataSource.filter = filterValue;
    }

    formDialog(action: string, workout: Workout | null): void {
        let params: any = {
            disableClose: true,
            width: '500px'
        };

        switch (action) {
            case 'add':
                params.data = {
                    workout: new Workout,
                    action: 'add'
                };
                break;
            case 'edit':
                params.data = {
                    workout: workout,
                    action: 'edit'
                };
                break;
        }

        let dialogRef = this.dialog.open(WorkoutFormDialog, params);

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                switch (action) {
                    case 'add':
                        this.workoutService.addWorkout(result)
                            .then((workout: Workout) => {
                                this.workouts.push(workout);
                                this.refreshTable();
                            }).catch(() => {
                                console.log('Errot while adding workout');
                            });
                        break;
                    case 'edit':
                        this.workoutService.putWorkout(result)
                            .then((workout: Workout) => {
                                this.updateWorkoutInTable(workout);
                            }).catch(() => {
                                console.log('Errot while adding workout');
                            });
                        break;
                }
            }
        });
    }

    refreshTable() {
        this.dataSource = new MatTableDataSource(this.workouts);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
    }

    deleteWorkout(workout: Workout) {
        let dialogRef = this.dialog.open(ConfirmDialog, {
            disableClose: true,
            data: {
                title: 'Etes vous sûr de vouloir supprimer ça ?',
                content: 'Séance "' + workout.description + '"'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
            if (result) {
                this.workoutService.deleteWorkout(workout.id).then(() => {
                    this.removeWorkoutFromTable(workout.id);
                }).catch(() => {
                    console.log('Error while deleting workout.');
                });
            }
        });
    }
    
    updateWorkoutInTable(updateWorkout: Workout) {
        let array_index = this.workouts.findIndex(workout => workout.id == updateWorkout.id); 
        this.workouts[array_index] = updateWorkout;
        this.refreshTable();
    }

    removeWorkoutFromTable(id: number) {
        let array_index = this.workouts.findIndex(workout => workout.id == id);
        this.workouts.splice(array_index, 1);
        this.refreshTable();

    }

}
