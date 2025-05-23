import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VenueService } from '../../services/venue.service';
import { BookingService } from '../../services/booking.service';
import { Venue } from '../../models/venue.model';
import { Booking } from '../../models/booking.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-venue-booking',
  templateUrl: './venue-booking.component.html',
  styleUrls: ['./venue-booking.component.css']
})
export class VenueBookingComponent implements OnInit {
  venues: Venue[] = [];
  bookingForm: FormGroup;
  bookings: Booking[] = [];
  isEditing: boolean = false;
  currentBookingId: number | null = null;
  displayedColumns: string[] = ['activityId', 'date', 'startTime', 'endTime', 'actions'];

  constructor(
    private fb: FormBuilder,
    private venueService: VenueService,
    private bookingService: BookingService,
    private snackBar: MatSnackBar
  ) {
    this.bookingForm = this.fb.group({
      venueId: ['', Validators.required],
      activityId: ['', Validators.required],
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadVenues();
    this.loadBookings();
  }

  loadVenues(): void {
    this.venueService.getAllVenues()
      .subscribe(venues => {
        this.venues = venues;
      });
  }

  loadBookings(): void {
    this.bookingService.getAllBookings()
      .subscribe(bookings => {
        this.bookings = bookings;
      });
  }

  onSubmit(): void {
    if (this.bookingForm.valid) {
      const booking: Booking = this.bookingForm.value;
      if (this.isEditing && this.currentBookingId) {
        // Update existing booking
        this.bookingService.updateBooking(this.currentBookingId, booking)
          .subscribe(() => {
            this.loadBookings();
            this.resetForm();
            this.showSnackBar('Booking updated successfully', 'success');
          }, error => {
            this.showSnackBar('Error updating booking', 'error');
          });
      } else {
        // Create new booking
        this.bookingService.createBooking(booking)
          .subscribe(() => {
            this.loadBookings();
            this.resetForm();
            this.showSnackBar('Booking created successfully', 'success');
          }, error => {
            this.showSnackBar('Error creating booking', 'error');
          });
      }
    }
  }

  editBooking(booking: Booking): void {
    this.isEditing = true;
    this.currentBookingId = booking.bookingId;
    this.bookingForm.patchValue({
      venueId: booking.venueId,
      activityId: booking.activityId,
      date: new Date(booking.date),
      startTime: booking.startTime,
      endTime: booking.endTime
    });
  }

  deleteBooking(booking: Booking): void {
    if (confirm('Are you sure you want to delete this booking?')) {
      this.bookingService.deleteBooking(booking.bookingId)
        .subscribe(() => {
          this.loadBookings();
          this.showSnackBar('Booking deleted successfully', 'success');
        }, error => {
          this.showSnackBar('Error deleting booking', 'error');
        });
    }
  }

  resetForm(): void {
    this.bookingForm.reset();
    this.isEditing = false;
    this.currentBookingId = null;
  }

  onVenueChange(venueId: number): void {
    const date = this.bookingForm.get('date')?.value;
    if (date) {
      this.bookingService.getBookingsByVenueAndDate(venueId, date)
        .subscribe(bookings => {
          this.bookings = bookings;
        });
    }
  }

  onDateChange(): void {
    const venueId = this.bookingForm.get('venueId')?.value;
    const date = this.bookingForm.get('date')?.value;
    if (venueId && date) {
      this.bookingService.getBookingsByVenueAndDate(venueId, date)
        .subscribe(bookings => {
          this.bookings = bookings;
        });
    }
  }

  private showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar']
    });
  }
} 